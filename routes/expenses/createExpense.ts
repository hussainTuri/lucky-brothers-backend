import { NextFunction, Response } from 'express';
import { saveExpense as saveExpenseRepository } from '../../prisma/repositories/expenses';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { AuthenticatedRequest } from '../../types';

export const createExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  req.body.createdById = req.user?.id ?? 0;

  try {
    resp.data = await saveExpenseRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
