import { NextFunction, Response } from 'express';
import { updateUser as updateUserRepository } from '../../prisma/repositories/users/';
import { response } from '../../lib/response';
import bcrypt from 'bcrypt';
import { messages } from '../../lib/constants';
import { AuthenticatedRequest } from '../../types';

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const resp = response();

  req.body.password = await bcrypt.hash(req.body.password, 10);
  req.body.updatedById = req.user?.id ?? 0;

  try {
    resp.data = await updateUserRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
