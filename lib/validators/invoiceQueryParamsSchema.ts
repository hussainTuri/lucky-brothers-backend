import Joi from 'joi';

export const queryParamsSchema = Joi.object({
  sort: Joi.string()
    .pattern(/^(id|createdAt),(asc|desc)$/)
    .optional(),
  status: Joi.string().valid('paid', 'pending', 'overdue', 'cancelled', 'refunded').optional(),
  skip: Joi.number().integer().min(1).max(1000).optional(),
  take: Joi.number().integer().min(1).max(1000).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});
