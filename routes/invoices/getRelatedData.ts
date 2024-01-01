import { NextFunction, Request, Response } from 'express';
import { getRelatedData as getRelatedDataRepository } from '../../prisma/repositories/invoices';
import { response } from '../../lib/response';

export const getRelatedData = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  resp.data = await getRelatedDataRepository();
  return res.json(resp);
};
