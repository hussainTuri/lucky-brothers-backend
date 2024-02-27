import { CustomerTransaction, Invoice, Prisma } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createCustomerTransactionSchema } from '../lib/validators/';
import { messages } from '../lib/constants';
import { getCustomer, getCustomerTransaction } from '../prisma/repositories/customers';
import { CustomerTransactionTypesEnum, TransactionModeEnum } from '../lib/enums';
import { InvoiceStatusEnum } from '../lib/enums/invoice';

const extractPaymentData = (payload: Partial<CustomerTransaction>) => {
  return {
    customerId: payload.customerId ?? null,
    typeId: payload.typeId ?? null,
    amount: payload.amount ?? null,
    comment: payload.comment ?? null,
    mode: payload.mode ?? TransactionModeEnum.Cash,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
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
    const pendingInvoices = customer.invoices.filter(
      (invoice) => invoice.statusId === InvoiceStatusEnum.Pending,
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

export const validateDeleteCustomerTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const transactionId = Number(req.params.transactionId);
  const customerId = Number(req.params.customerId);
  if (!transactionId) {
    resp.message = messages.INVALID_CUSTOMER_TRANSACTION_ID;
    resp.success = false;
    return res.status(400).json(resp);
  }
  if (!customerId) {
    resp.message = messages.INVALID_CUSTOMER_ID;
    resp.success = false;
    return res.status(400).json(resp);
  }

  // make sure that the transaction is a customer payment ie type is payment and invoice is null
  const transaction = await getCustomerTransaction(transactionId);
  if (!transaction) {
    resp.message = messages.CUSTOMER_TRANSACTION_NOT_FOUND;
    resp.success = false;
    return res.status(400).json(resp);
  }

  if (
    transaction.typeId !== CustomerTransactionTypesEnum.Payment ||
    transaction.invoiceId !== null
  ) {
    resp.message = messages.CUSTOMER_TRANSACTION_DELETE_NOT_ALLOWED;
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};
