import { Expense } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createExpenseSchema, updateExpenseSchema } from '../lib/validators/';

const extractExpenseData = (payload: Partial<Expense>) => {
  return {
    amount: payload.amount ?? null,
    description: payload.description ?? null,
  };
};

export const normalizeCreateData = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<Expense>;
  const expenseEntry = extractExpenseData(payload) as Partial<Expense>;
  req.body = expenseEntry;
  next();
};

export const normalizeUpdateData = async (req: Request, res: Response, next: NextFunction) => {
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
