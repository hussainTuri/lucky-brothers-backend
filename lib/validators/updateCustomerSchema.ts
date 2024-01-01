import Joi from 'joi';
import { createCustomerSchema } from './createCustomerSchema';

export const updateCustomerSchema = createCustomerSchema.keys({
  id: Joi.number().integer().positive().required(),
});
