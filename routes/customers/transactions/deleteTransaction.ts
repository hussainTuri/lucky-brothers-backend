import { NextFunction, Request, Response } from 'express';
import { deleteTransaction as deleteCustomerTransactionRepository } from '../../../prisma/repositories/customers/';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await deleteCustomerTransactionRepository(Number(req.params.transactionId));
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
