import { Customer, Invoice, InvoiceItem, Prisma } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createCustomerSchema, queryParamsSchema } from '../lib/validators/';
import { createInvoiceSchema, updateInvoiceSchema } from '../lib/validators/';
import { extractCustomerData } from './customerValidators';
import { UCFirst, UCFirstLCRest, trimSpaces } from '../lib/utils';

export const validateQueryParams = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = queryParamsSchema.validate(req.query, { allowUnknown: true });
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
    driverName: UCFirstLCRest(trimSpaces((payload.driverName as string) ?? null)),
    vehicleName: UCFirst(trimSpaces((payload.vehicleName as string) ?? null)),
    vehicleRegistrationNumber: trimSpaces((payload.vehicleRegistrationNumber as string) ?? null),
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
export const normalizeUpdateData = async (req: Request, res: Response, next: NextFunction) => {
  const invoicePayload = req.body?.invoice as Partial<Invoice>;
  const itemsPayload = req.body?.items as Partial<InvoiceItem>[];
  let invoice = null;
  let items = null;

  if (invoicePayload) invoice = extractInvoiceData(invoicePayload) as Invoice;
  if (itemsPayload)
    items = itemsPayload.map((i) => {
      const item = extractInvoiceItemData(i) as InvoiceItem;
      if (i.id) item.id = i.id;
      return item;
    });

  if (invoice) invoice.id = invoicePayload.id ?? 0;

  req.body = { ...req.body, invoice, items };
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

export const validateUpdateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const data = { ...req.body.invoice };
  data.items = req.body.items;
  const { error } = updateInvoiceSchema.validate(data, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};
