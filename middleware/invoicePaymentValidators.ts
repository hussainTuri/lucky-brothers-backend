import { InvoicePayment, Prisma } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createInvoicePaymentSchema } from '../lib/validators/';
import { getInvoice } from '../prisma/repositories/invoices';
import { messages } from '../lib/constants';
import { InvoiceIncludeOptions } from '../types/includeOptions';

const extractPaymentData = (payload: Partial<InvoicePayment>) => {
  return {
    invoiceId: payload.invoiceId ?? null,
    amount: payload.amount ?? null,
    comment: payload.comment ?? null,
  };
};

export const normalizeCreateData = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<InvoicePayment>;
  const payment = extractPaymentData(payload) as Partial<InvoicePayment>;
  req.body = payment;
  next();
};

// export const normalizeUpdateData = async (req: Request, res: Response, next: NextFunction) => {
//   const payload = req.body as Partial<InvoicePayment>;
//   const payment = extractPaymentData(payload) as Partial<InvoicePayment>;
//   payment.id = req.body.id ?? 0;
//   req.body = payment;
//   next();
// };

export const validateCreateInvoicePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createInvoicePaymentSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  try {
    const includeOptions: InvoiceIncludeOptions = {
      payments: true,
    };
    const invoice = await getInvoice(req.body.invoiceId, includeOptions);
    const balance =
      invoice.totalAmount -
      (invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0);

    // Validate that the amount does not exceed the invoice balance
    if (balance < req.body.amount) {
      resp.success = false;
      resp.message = messages.PAYMENT_EXCEEDS_BALANCE;
      return res.status(400).json(resp);
    }

    // Registered customer should not use payment via this method but through customer payments
    if (invoice.customerId) {
      resp.success = false;
      resp.message = messages.CUSTOMER_PAYMENT_NOT_ALLOWED;
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
