import { Customer, Invoice, InvoiceItem, Prisma } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createCustomerSchema, queryParamsSchema } from '../lib/validators/';
import { createInvoiceSchema } from '../lib/validators/invoiceCreateSchema';
import { extractCustomerData } from './customerValidators';

export const validateQueryParams = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = queryParamsSchema.validate(req.query, { allowUnknown: true });
  console.log('error', error);
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

const extractInvoiceData = (payload: Partial<Invoice>) => {
  return {
    customerId: payload.customerId ?? null,
    totalAmount: payload.totalAmount ?? null,
    dueDate: payload.dueDate ?? null,
    statusId: payload.statusId ?? null,
    comment: payload.comment ?? null,
    driverName: payload.driverName ?? null,
    vehicleName: payload.vehicleName ?? null,
    vehicleRegistrationNumber: payload.vehicleRegistrationNumber ?? null,
  };
};
const extractInvoiceItemData = (payload: Partial<InvoiceItem>) => {
  return {
    productId: payload.productId ?? null,
    quantity: payload.quantity ?? null,
    price: payload.price ?? null,
    subTotal: payload.subTotal ?? null,
  };
};

export const normalizeCreateData = async (req: Request, res: Response, next: NextFunction) => {
  const invoicePayload = req.body?.invoice as Partial<Invoice>;
  const itemsPayload = req.body?.items as Partial<InvoiceItem>[];
  const customerPayload = req.body?.customer as Partial<Customer>;
  let invoice = null;
  let items = null;
  let customer = null;

  if (invoicePayload) invoice = extractInvoiceData(invoicePayload);
  if (itemsPayload) items = itemsPayload.map((i) => extractInvoiceItemData(i));
  if (
    customerPayload &&
    customerPayload?.customerName &&
    customerPayload?.phone &&
    !req.body?.invoice.customerId
  )
    customer = extractCustomerData(customerPayload);

  req.body = { ...req.body, invoice, items, customer };
  next();
};

export const validateCreateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const data = { ...req.body.invoice };
  data.items = req.body.items;
  const { error } = createInvoiceSchema.validate(data, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  if (req.body.customer && !req.body.invoice.customerId) {
    const { error } = createCustomerSchema.validate(req.body.customer, { allowUnknown: true });
    if (error) {
      resp.message = error.details[0].message || '';
      resp.success = false;
      return res.status(400).json(resp);
    }
  }
  next();
};
