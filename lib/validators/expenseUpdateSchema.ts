import Joi from 'joi';
import { createExpenseSchema } from './expenseCreateSchema';

export const updateExpenseSchema = createExpenseSchema.keys({
  id: Joi.number().integer().positive().required(),
});
