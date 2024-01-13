import Joi from 'joi';
import { createProductSchema } from './productCreateSchema';

export const updateProductSchema = createProductSchema.keys({
  id: Joi.number().integer().positive().required(),
});
