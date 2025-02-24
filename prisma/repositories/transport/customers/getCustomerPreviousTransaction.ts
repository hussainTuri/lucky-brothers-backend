import { PrismaClient } from '@prisma/client';
import { OmitPrismaClient } from '../../../../types';
const prisma = new PrismaClient();

/**
 * Get the previous transaction
 * @param transactionId number
 * @param tx
 * @returns
 */
export const getCustomerPreviousTransaction = async (
  transactionId: number,
  tx: OmitPrismaClient,
) => {
  const lastTransaction = await tx.transportCustomerTransaction.findFirst({
    where: {
      id: {
        lt: transactionId,
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  return lastTransaction;
};
