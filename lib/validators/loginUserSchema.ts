import Joi from 'joi';

export const loginUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
