import { PrismaClient } from '@prisma/client';
import { OmitPrismaClient } from '../../../../types';
const prisma = new PrismaClient();

/**
 * Get the current balance of the customer
 * @param customerId number
 * @param tx
 * @returns
 */
export const getCustomerCurrentTransactionBalance = async (
  customerId: number,
  tx: OmitPrismaClient,
) => {
  const lastTransaction = await tx.transportCustomerTransaction.findFirst({
    where: {
      customerId: customerId,
    },
    orderBy: {
      id: 'desc',
    },
  });

  if (lastTransaction) {
    return lastTransaction.balance;
  }
  return 0;
};

//
