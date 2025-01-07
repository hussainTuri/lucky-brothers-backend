import { NextFunction, Request, Response } from 'express';
import { getUsers as getUsersRepository } from '../../prisma/repositories/users/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import * as Sentry from '@sentry/node';
import { Timer } from '../../lib/utils';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    const timer = new Timer('GET /users - route handler');
    resp.data = await getUsersRepository();
    timer.stop();
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
