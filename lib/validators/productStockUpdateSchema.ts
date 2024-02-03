import Joi from 'joi';
import { createProductStockSchema } from './productStockCreateSchema';

export const updateProductStockSchema = createProductStockSchema.keys({
  id: Joi.number().integer().positive().required(),
});
