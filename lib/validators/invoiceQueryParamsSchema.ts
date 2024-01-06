import Joi from 'joi';

export const queryParamsSchema = Joi.object({
  sort: Joi.string()
    .pattern(/^(id|createdAt),(asc|desc)$/)
    .optional(),
  status: Joi.string().valid('paid', 'pending', 'overdue').optional(),
  take: Joi.number().integer().min(1).max(1000).optional(),
});
