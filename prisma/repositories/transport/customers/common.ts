import { PrismaClient, TransportCustomerTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../types';
const prisma = new PrismaClient();

/**
 * Get the current balance of the customer
 * @param customerId number
 * @param tx
 * @returns
 */
export const getCustomerCurrentTransactionBalance = async (customerId: number, tx: OmitPrismaClient) => {
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

/**
 * Get the previous transaction
 * @param transactionId number
 * @param tx
 * @returns
 */
const getCustomerPreviousTransaction = async (transactionId: number, tx: OmitPrismaClient) => {
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

/**
 * For a given customer transaction, get the balance from the previous transaction
 *
 * @param transaction TransportCustomerTransaction
 * @param tx
 * @returns
 */
export const getCustomerBalanceForTransaction = async (
  transaction: TransportCustomerTransaction,
  tx: OmitPrismaClient,
) => {
  const lastTransaction = await getCustomerPreviousTransaction(transaction.id, tx);

  if (lastTransaction) {
    return lastTransaction.balance + transaction.amount;
  }
  return transaction.amount;
};
//
