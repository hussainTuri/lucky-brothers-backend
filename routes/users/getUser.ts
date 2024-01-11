import { NextFunction, Request, Response } from 'express';
import { getUser as getUserRepository } from '../../prisma/repositories/users/';
import { response } from '../../lib/response';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  resp.data = await getUserRepository(req.params.userId);
  return res.json(resp);
};
