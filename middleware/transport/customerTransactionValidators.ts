import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';

export const validateDeleteTransportCustomerTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();

  const transactionId = Number(req.params.transactionId);
  const customerId = Number(req.params.customerId);
  if (!transactionId || !customerId) {
    resp.message = messages.TRANSPORT_CUSTOMER_TRANSACTION_AND_CUSTOMER_ID_REQUIRED;
    resp.success = false;
    return res.status(400).json(resp);
  }

  // TODO: Do not allow deletions of Rent transactions

  next();
};
