import { PrismaClient, TransportCustomerTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';

export const updateTransportCustomerTransaction = async (
  entry: TransportCustomerTransaction,
  tx: OmitPrismaClient,
): Promise<TransportCustomerTransaction | null> => {
  const entryUpdated = await tx.transportCustomerTransaction.update({
    where: {
      id: entry.id,
    },
    data: {
      amount: entry.amount,
      balance: entry.balance,
      comment: entry?.comment,
    },
  });

  return entryUpdated;
};
