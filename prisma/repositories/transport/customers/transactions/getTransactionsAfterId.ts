import {  TransportCustomerTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';

export const getTransportCustomerTransactionsAfterId = async (
  customerId: number,
  id: number,
  tx: OmitPrismaClient,
): Promise<TransportCustomerTransaction[]> => {
  return tx.transportCustomerTransaction.findMany({
    where: {
      id: {
        gt: id,
      },
      customerId,
    },
  });
};
