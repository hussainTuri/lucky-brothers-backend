import Joi from 'joi';

export const createUserSchema = Joi.object({
  fullName: Joi.string().max(255).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().max(255).allow(null).allow('').optional(),
  address: Joi.string().max(255).allow(null).allow('').optional(),
});
