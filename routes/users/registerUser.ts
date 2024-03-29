import { NextFunction, Request, Response } from 'express';
import { saveUser as saveUserRepository } from '../../prisma/repositories/users';
import { response } from '../../lib/response';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { messages } from '../../lib/constants';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  req.body.password = await bcrypt.hash(req.body.password, 10);

  try {
    const user = await saveUserRepository(req.body);
    delete (user as { password?: string }).password;
    resp.data = user;
  } catch (e: any) {
    console.error('DB Error', e);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        resp.message = messages.USERNAME_TAKEN;
      }
    }
    return res.status(400).json(resp);
  }

  return res.json(resp);
};
