import { TransportCustomerTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import { getCustomerBalanceForTransaction, getTransportCustomerTransactionsAfterId } from '.';

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

export const updateTransportCustomerTransactionWithBalances = async (
  entry: TransportCustomerTransaction,
  tx: OmitPrismaClient,
): Promise<TransportCustomerTransaction | null> => {
    // 1. Update vehicle transaction
    entry.balance = await getCustomerBalanceForTransaction(entry, tx);
    const entryUpdated = await updateTransportCustomerTransaction(entry, tx);

    // 2. Update balance in all transactions after this transaction
    let balance = entry.balance;
    const transactions = await getTransportCustomerTransactionsAfterId(entry.customerId, entry.id, tx);

    transactions.forEach((transaction) => {
      transaction.balance = balance + transaction.amount;
      balance = transaction.balance;
    });
    for (const transaction of transactions) {
      await updateTransportCustomerTransaction(transaction, tx);
    }

    return entryUpdated;
};
