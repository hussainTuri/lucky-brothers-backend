import Joi from 'joi';
import { createTransportCustomerSchema } from './customerCreateSchema';

export const updateTransportCustomerSchema = createTransportCustomerSchema.keys({
  id: Joi.number().integer().positive().required(),
});
