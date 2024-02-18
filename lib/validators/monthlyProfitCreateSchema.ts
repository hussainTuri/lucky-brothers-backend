import Joi from 'joi';

export const createMonthlyProfitSchema = Joi.object({
  monthYear: Joi.string().length(7).required(),
  sales: Joi.number().integer().allow(0).required(),
  expense: Joi.number().integer().allow(0).required(),
  profit: Joi.number().integer().allow(0).required(),
  description: Joi.string().max(255).allow(null).allow(''),
});
