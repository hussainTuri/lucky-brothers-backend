import Joi from 'joi';
import { createUserSchema } from './createUserSchema';

export const updateUserSchema = createUserSchema.keys({
  id: Joi.number().integer().positive().required(),
});
