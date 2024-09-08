import { NextFunction, Response } from 'express';
import { updateStock as updateStockInventoryRepository } from '../../../prisma/repositories/products/';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import { AuthenticatedRequest } from '../../../types';

export const updateStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const resp = response();
  req.body.updatedById = req.user?.id ?? 0;

  try {
    resp.data = await updateStockInventoryRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
