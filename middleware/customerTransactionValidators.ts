import { CustomerTransaction, Invoice, Prisma } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createCustomerTransactionSchema } from '../lib/validators/';
import { getRelatedData } from '../prisma/repositories/invoices';
import { messages } from '../lib/constants';
import { getCustomer } from '../prisma/repositories/customers';

const extractPaymentData = (payload: Partial<CustomerTransaction>) => {
  return {
    customerId: payload.customerId ?? null,
    typeId: payload.typeId ?? null,
    amount: payload.amount ?? null,
    comment: payload.comment ?? null,
  };
};

export const normalizeCreateData = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<CustomerTransaction>;
  const payment = extractPaymentData(payload) as Partial<CustomerTransaction>;
  req.body = payment;
  next();
};

export const validateCreateCustomerTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createCustomerTransactionSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  try {
    const customer = await getCustomer(req.body.customerId);
    if (!customer) {
      resp.success = false;
      resp.message = messages.CUSTOMER_NOT_FOUND;
      return res.status(400).json(resp);
    }

    // Validate that the amount does not exceed the sum of pending invoices amounts
    const data = await getRelatedData();
    const pendingInvoices = customer.invoices.filter(
      (invoice) => invoice.statusId === data.statuses.find((i) => i.statusName === 'Pending')?.id!,
    ) as Invoice[];
    const pendingInvoicesAmount = pendingInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0,
    );
    if (pendingInvoicesAmount < req.body.amount) {
      resp.success = false;
      resp.message = messages.PAYMENT_EXCEEDS_PENDING_INVOICES;
      return res.status(400).json(resp);
    }
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  next();
};
