import { Expense } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createExpenseSchema, updateExpenseSchema } from '../lib/validators/';
import { TransactionModeEnum } from '../lib/enums';

const extractExpenseData = (payload: Partial<Expense>) => {
  return {
    amount: payload.amount ?? null,
    description: payload.description ?? null,
    expenseDate: payload.expenseDate ? new Date(payload.expenseDate) : null,
    mode: payload.mode ?? TransactionModeEnum.Cash,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<Expense>;
  const expenseEntry = extractExpenseData(payload) as Partial<Expense>;
  req.body = expenseEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<Expense>;
  const expenseEntry = extractExpenseData(payload) as Partial<Expense>;
  expenseEntry.id = payload.id ?? undefined;
  req.body = expenseEntry;
  next();
};

export const validateCreateExpense = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = createExpenseSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateExpense = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = updateExpenseSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
