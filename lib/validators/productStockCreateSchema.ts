import Joi from 'joi';

export const createProductStockSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  originalQuantity: Joi.number().integer().min(1).required(),
  pricePerItem: Joi.number().allow(0).allow(null),
});
