import Joi from 'joi';

export const createCustomerTransactionSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  typeId: Joi.number().integer().valid(1, 2).required(),
  amount: Joi.number().integer().positive().required(),
  comment: Joi.string().max(255).allow(null).allow(''),
});
