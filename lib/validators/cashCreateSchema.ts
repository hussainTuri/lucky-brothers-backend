import Joi from 'joi';

export const createCashSchema = Joi.object({
  amount: Joi.number().integer().positive().required(),
  description: Joi.string().max(255).allow(null).allow(''),
  cashDate: Joi.date().required(),
  mode: Joi.number().integer().positive().required(),
});
