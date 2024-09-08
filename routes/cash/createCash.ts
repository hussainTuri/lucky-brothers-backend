import { NextFunction, Response } from 'express';
import { saveCash as saveCashRepository } from '../../prisma/repositories/cash';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { AuthenticatedRequest } from '../../types';

export const createCash = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const resp = response();
  req.body.createdById = req.user?.id ?? 0;

  try {
    resp.data = await saveCashRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
