import { NextFunction, Request, Response } from 'express';
import { updateUser as updateUserRepository } from '../../prisma/repositories/users/';
import { response } from '../../lib/response';
import bcrypt from 'bcrypt';

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  let user = null;

  req.body.password = await bcrypt.hash(req.body.password, 10);

  try {
    user = await updateUserRepository(req.body);
    if (user === null) {
      resp.success = false;
      resp.message = 'Failed to update user';
      return res.status(400).json(resp);
    }
  } catch (e: any) {
    // we will only catch error we throw explicitly
    console.log('user error ', e);

    resp.success = false;
    resp.message = e.message;
    return res.status(400).json(resp);
  }

  resp.data = user;
  return res.json(resp);
};
