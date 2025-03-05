import { TransportCustomerTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import { getTransportCustomerPreviousTransaction } from '.';

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
  const lastTransaction = await getTransportCustomerPreviousTransaction(
    transaction.customerId,
    transaction.id,
    tx,
  );

  if (lastTransaction) {
    return lastTransaction.balance + transaction.amount;
  }
  return transaction.amount;
};
