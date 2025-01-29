import Joi from 'joi';

export const createInvoiceItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  price: Joi.number().integer().positive().required(),
  subTotal: Joi.number().integer().positive().required(),
});

export const createInvoiceSchema = Joi.object({
  customerId: Joi.number().integer().positive().allow(null),
  totalAmount: Joi.number().integer().positive().required(),
  totalAmountExcVat: Joi.number().integer().positive().required(),
  dueDate: Joi.date().iso().optional().allow(null).allow(''),
  statusId: Joi.number().integer().positive().required(),
  comment: Joi.string().max(255).allow(null).allow(''),
  items: Joi.array().items(createInvoiceItemSchema),
  vat: Joi.number().allow(0).allow(null),
  vatClearedAt: Joi.date().iso().optional().allow(null).allow(''),
  vatClearingMode: Joi.number().integer().optional(),
  vatRate: Joi.number().allow(0).allow(null),
  trn: Joi.string().max(255).allow(null).allow(''),
});
