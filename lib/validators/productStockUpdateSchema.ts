import Joi from 'joi';
import { createProductStockSchema } from './productStockCreateSchema';

export const updateProductStockSchema = createProductStockSchema.keys({
  id: Joi.number().integer().positive().required(),
  remainingQuantity: Joi.number().integer().min(0).max(Joi.ref('originalQuantity')).required(),
});
