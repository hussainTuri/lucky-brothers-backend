import Joi from 'joi';
import { createInvoiceSchema } from './invoiceCreateSchema';

export const updateInvoiceSchema = createInvoiceSchema.keys({
  id: Joi.number().integer().positive().required(),
});
