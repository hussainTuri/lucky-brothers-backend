import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { queryParamsSchema } from '../lib/validators/';

export const validateQueryParams = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = queryParamsSchema.validate(req.query, { allowUnknown: true });
  console.log('error', error);
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
