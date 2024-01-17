import { NextFunction, Request, Response } from 'express';
import { getUserByUsername as getUserByUsernameRepository } from '../../prisma/repositories/users';
import { response } from '../../lib/response';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from 'process';
import { messages } from '../../lib/constants';

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { username, password } = req.body;
  let user = null;

  try {
    user = await getUserByUsernameRepository(username);
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      resp.success = false;
      resp.message = messages.INVALID_CREDENTIALS;
      return res.status(400).json(resp);
    }
    delete (user as { password?: string }).password;

    // Generate JWT token
    resp.data = jwt.sign(user, env.JWT_SECRET as string, {
      expiresIn: '10h',
      algorithm: 'HS256',
    });
  } catch (e: any) {
    console.error('DB Error', e);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
