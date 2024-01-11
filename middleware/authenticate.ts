import { Request, Response, NextFunction } from 'express';
import { response } from '../lib/response';
import jwt from 'jsonwebtoken';
import { env } from 'process';
import { User } from '@prisma/client';
import { AuthenticatedRequest } from '../types/api';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const resp = response();

  const tokenHeader = req.header('Authorization');
  const token = tokenHeader?.split(' ')[1]
  if (!token) {
    resp.message = 'Unauthorized';
    resp.success = false;
    return res.status(401).json(resp);
  }

  jwt.verify(token, env.JWT_SECRET as string, (err, user) => {
    if (err) {
      console.error('jwt error', err);
      resp.message = 'Forbidden';
      resp.success = false;
      return res.status(403).json(resp);
    }
    req.user = user as Partial<User>;
    next();
  });
};
