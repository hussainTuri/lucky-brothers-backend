import Joi from 'joi';
import { createCustomerSchema } from './customerCreateSchema';

export const updateCustomerSchema = createCustomerSchema.keys({
  id: Joi.number().integer().positive().required(),
});
