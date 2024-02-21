import Joi from 'joi';
import { createCashSchema } from './cashCreateSchema';

export const updateCashSchema = createCashSchema.keys({
  id: Joi.number().integer().positive().required(),
});
