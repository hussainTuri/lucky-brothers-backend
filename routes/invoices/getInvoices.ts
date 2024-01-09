import { NextFunction, Request, Response } from 'express';
import { getInvoices as getInvoicesRepository } from '../../prisma/repositories/invoices';
import { response } from '../../lib/response';
import { QueryOptions, QueryInvoiceStatus, QuerySort, SortOrder } from '../../types';

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const filters = {} as QueryOptions;
  if (req.query?.status) {
    filters.status = req.query.status as QueryInvoiceStatus;
  }

  if (req.query?.today !== undefined) {
    filters.today = true;
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

  resp.data = await getInvoicesRepository(filters, sort);
  return res.json(resp);
};
