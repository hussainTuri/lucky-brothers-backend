import Joi from 'joi';

export const createProductInventorySchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().required(),
  reason: Joi.string().max(255).allow(null).allow(''),
});
