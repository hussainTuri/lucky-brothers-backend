import Joi from 'joi';

export const createDailyReportSchema = Joi.object({
  reportDate: Joi.date().required(),
  sales: Joi.number().integer().allow(0).required(),
  expense: Joi.number().integer().allow(0).required(),
  receiveCash: Joi.number().integer().allow(0).required(),
  payCash: Joi.number().integer().allow(0).required(),
  buyStock: Joi.number().integer().allow(0).required(),
  description: Joi.string().max(255).allow(null).allow(''),
});
