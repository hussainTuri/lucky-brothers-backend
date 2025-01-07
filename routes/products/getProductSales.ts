import { Request, Response } from 'express';
import { response } from '../../lib/response';
import { QueryOptions, QuerySort, SortOrder } from '../../types';
import * as Sentry from '@sentry/node';
import { messages } from '../../lib/constants';
import { getProductSales as getProductSalesRepository } from '../../prisma/repositories/products';

export const getProductSales = async (req: Request, res: Response) => {
  const resp = response();

  const filters = {} as QueryOptions;
  if (req.query?.skip) {
    filters.skip = Number(req.query.skip);
  }

  if (req.query?.take) {
    filters.take = Number(req.query.take);
  }

  const sort = {} as QuerySort;
  const sortParam = req.query?.sort ?? '';
  if (typeof sortParam === 'string' && sortParam.length > 0) {
    const [sortField, sortOrder] = sortParam.split(',');
    sort[sortField as keyof QuerySort] = sortOrder as SortOrder;
  }

  try {
    resp.data = await getProductSalesRepository(req.params.productId, filters, sort);
    // console.log('resp', resp);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};

//
