import { NextFunction, Request, Response } from 'express';
import { updateCashOut as updateCashOutRepository } from '../../prisma/repositories/cashOut';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';

export const updateCashOut = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await updateCashOutRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
