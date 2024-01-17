import Joi from 'joi';

export const createInvoicePaymentSchema = Joi.object({
  invoiceId: Joi.number().integer().positive().required(),
  amount: Joi.number().integer().positive().required(),
  comment: Joi.string().max(255).allow(null).allow(''),
});
