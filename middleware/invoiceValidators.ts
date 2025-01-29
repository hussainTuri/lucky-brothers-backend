import { Customer, Invoice, InvoiceItem } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../lib/response';
import {
  createCustomerSchema,
  queryParamsSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
} from '../lib/validators/';
import { extractCustomerData } from './customerValidators';
import { UCFirst, UCFirstLCRest, trimSpaces } from '../lib/utils';
import { getInvoice } from '../prisma/repositories/invoices';
import { InvoiceIncludeOptions } from '../types/includeOptions';
import { messages } from '../lib/constants';
import { InvoiceStatusEnum } from '../lib/enums/invoice';
import { TransactionModeEnum } from '../lib/enums';

export const validateQueryParams = (req: Request, res: Response, next: NextFunction) => {
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
    totalAmountExcVat: payload.totalAmountExcVat ?? null,
    dueDate: payload.dueDate ?? null,
    statusId: payload.statusId ?? null,
    comment: payload.comment ?? null,
    driverName: UCFirstLCRest(trimSpaces((payload.driverName as string) ?? null)),
    vehicleName: UCFirst(trimSpaces((payload.vehicleName as string) ?? null)),
    vehicleRegistrationNumber: trimSpaces((payload.vehicleRegistrationNumber as string) ?? null),
    vat: payload.vat ?? '0',
    vatClearedAt: payload.vatClearedAt ?? null,
    vatClearingMode: payload.vatClearingMode ?? 0,
    vatRate: payload.vatRate ?? 0,
    trn: trimSpaces((payload.trn as string) ?? null),
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

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const invoicePayload = req.body?.invoice as Partial<Invoice>;
  const itemsPayload = req.body?.items as Partial<InvoiceItem>[];
  const customerPayload = req.body?.customer as Partial<Customer>;
  const mode = req.body?.mode || TransactionModeEnum.Cash;
  let invoice = null;
  let items = null;
  let customer = null;

  if (invoicePayload) invoice = extractInvoiceData(invoicePayload);
  if (itemsPayload) items = itemsPayload.map((i) => extractInvoiceItemData(i));
  if (customerPayload?.customerName && customerPayload?.phone && !req.body?.invoice.customerId)
    customer = extractCustomerData(customerPayload);

  req.body = { ...req.body, invoice, items, customer, mode };
  next();
};
export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
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

  if (
    !req.body.customer &&
    !req.body.invoice.customerId &&
    data.statusId === InvoiceStatusEnum.Pending
  ) {
    resp.message = messages.INVOICE_CUSTOMER_REQUIRED;
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const data = { ...req.body.invoice };
  data.items = req.body.items;
  const { error } = updateInvoiceSchema.validate(data, { allowUnknown: true });

  // if new total amount is less than paid amount, throw error, send error message to client
  const includeOptions: InvoiceIncludeOptions = {
    payments: true,
  };
  const invoice = await getInvoice(req.body.invoice.id as number, includeOptions);
  if (!invoice) {
    resp.message = messages.INVOICE_NOT_FOUND;
    resp.success = false;
    return res.status(400).json(resp);
  }

  // Before this id, we were using old inventory structure, so we can't update those invoices
  if (invoice.id <= 156) {
    resp.message = messages.INVOICE_OLD_UPDATE_NOT_ALLOWED;
    resp.success = false;
    return res.status(400).json(resp);
  }

  const payments = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  if (payments > req.body.invoice.totalAmount) {
    resp.message = messages.PAID_AMOUNT_GREATER_THAN_TOTAL_AMOUNT;
    resp.success = false;
    return res.status(400).json(resp);
  }

  // if invoices status is not pending, throw error, send error message to client
  if (invoice.statusId !== InvoiceStatusEnum.Pending) {
    resp.message = messages.INVOICE_NOT_PENDING;
    resp.success = false;
    return res.status(400).json(resp);
  }

  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};
