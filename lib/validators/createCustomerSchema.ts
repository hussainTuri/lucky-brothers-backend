import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  customerName: Joi.string().max(255).required(),
  email: Joi.string().max(255).allow(null).allow('').optional(),
  phone: Joi.string().max(255).required(),
  address: Joi.string().max(255).allow(null).allow('').optional(),
  imagePath: Joi.string().max(255).allow(null).allow('').optional(),
});
