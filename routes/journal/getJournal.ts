import { NextFunction, Request, Response } from 'express';
import { getJournal as getJournalRepository } from '../../prisma/repositories/journal';
import { response } from '../../lib/response';
import { QueryOptions } from '../../types';
import { messages } from '../../lib/constants';
import * as Sentry from '@sentry/node';

export const getJournal = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const filters = {} as QueryOptions;

  if (req.query?.date) {
    const s = new Date(req.query.date as string);
    s.setHours(0, 0, 0, 0);
    filters.startDate = s;
    const e = new Date(req.query.date as string);
    e.setHours(23, 59, 59, 999);
    filters.endDate = e;
  } else {
    // today
    const s = new Date();
    s.setHours(0, 0, 0, 0);
    filters.startDate = s;
    const e = new Date();
    e.setHours(23, 59, 59, 999);
    filters.endDate = e;
  }

  try {
    resp.data = await getJournalRepository(filters);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }
  return res.json(resp);
};
