import { NextFunction, Response } from 'express';
import { updateExpense as updateExpenseRepository } from '../../prisma/repositories/expenses';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { AuthenticatedRequest } from '../../types';
import * as Sentry from '@sentry/node';

export const updateExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  req.body.updatedById = req.user?.id ?? 0;

  try {
    resp.data = await updateExpenseRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
