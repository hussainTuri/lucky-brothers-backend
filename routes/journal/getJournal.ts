import { NextFunction, Request, Response } from 'express';
import { getJournal as getJournalRepository } from '../../prisma/repositories/journal';
import { response } from '../../lib/response';
import { QueryOptions, QuerySort, SortOrder } from '../../types';
import { messages } from '../../lib/constants';

export const getJournal = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const filters = {} as QueryOptions;

  if (req.query?.startDate) {
    const s = new Date(req.query.startDate as string);
    s.setHours(0, 0, 0, 0);
    filters.startDate = s;
  }
  if (req.query?.endDate) {
    const e = new Date(req.query.endDate as string);
    e.setHours(23, 59, 59, 999);
    filters.endDate = e;
  }

  if (req.query?.skip) {
    filters.skip = Number(req.query.skip);
  }

  if (req.query?.take) {
    filters.take = Number(req.query.take);
  }

  const sort = {} as QuerySort;
  const sortParam = req.query?.sort as string;
  if (sortParam) {
    const [sortField, sortOrder] = sortParam.split(',');
    sort[sortField as keyof QuerySort] = sortOrder as SortOrder;
  }

  try {
    resp.data = await getJournalRepository(filters, sort);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }
  return res.json(resp);
};
