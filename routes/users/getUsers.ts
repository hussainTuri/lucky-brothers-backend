import { NextFunction, Request, Response } from 'express';
import { getUsers as getUsersRepository } from '../../prisma/repositories/users/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import * as Sentry from '@sentry/node';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await getUsersRepository();
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};