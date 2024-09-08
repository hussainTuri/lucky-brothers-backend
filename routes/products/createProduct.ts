import { NextFunction, Response } from 'express';
import { saveProduct as saveProductRepository } from '../../prisma/repositories/products/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { AuthenticatedRequest } from '../../types';

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  req.body.createdById = req.user?.id ?? 0;

  try {
    resp.data = await saveProductRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
