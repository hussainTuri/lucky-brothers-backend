import Joi from 'joi';
import { createProductSchema } from './createProductSchema';

export const updateProductSchema = createProductSchema.keys({
  id: Joi.number().integer().positive().required(),
});
