import { Request, Response, NextFunction } from 'express';

export const cleanTransportCustomerSearchInput = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.term) {
    req.body.term = req.body.term.trim();
  }
  next();
};
