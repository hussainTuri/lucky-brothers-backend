import Joi from 'joi';
import { createCashOutSchema } from './cashOutCreateSchema';

export const updateCashOutSchema = createCashOutSchema.keys({
  id: Joi.number().integer().positive().required(),
});
