import Joi from 'joi';
import { createUserSchema } from './userCreateSchema';

export const updateUserSchema = createUserSchema.keys({
  id: Joi.number().integer().positive().required(),
});
