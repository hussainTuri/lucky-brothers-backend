import Joi from 'joi';

export const createExpenseSchema = Joi.object({
  amount: Joi.number().integer().positive().required(),
  description: Joi.string().max(255).allow(null).allow(''),
  expenseDate: Joi.date().required(),
  mode: Joi.number().integer().positive().required(),
});
