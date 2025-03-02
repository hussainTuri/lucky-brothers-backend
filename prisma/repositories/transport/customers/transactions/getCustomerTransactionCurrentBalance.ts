import { OmitPrismaClient } from '../../../../../types';

/**
 * Get the current balance of the customer
 * @param customerId number
 * @param tx
 * @returns
 */
export const getCustomerTransactionCurrentBalance = async (
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
