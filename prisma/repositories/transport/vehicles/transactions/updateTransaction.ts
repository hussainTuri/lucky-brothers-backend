import { PrismaClient, TransportVehicleTransaction } from '@prisma/client';
import { getBalanceForTransaction, getTransactionsAfterId, updateTransaction } from './common';

const prisma = new PrismaClient();

export const updateVehicleTransaction = async (
  entry: TransportVehicleTransaction,
): Promise<TransportVehicleTransaction | null> => {
  return prisma.$transaction(async (tx) => {
    // 1. Update vehicle transaction
    entry.balance = await getBalanceForTransaction(entry, tx);
    const entryUpdated = await updateTransaction(entry, tx);

    // 2. Update balance in all transactions after this transaction
    let balance = entry.balance;
    const transactions = await getTransactionsAfterId(entry.id, tx);

    transactions.forEach((transaction) => {
      transaction.balance = balance + transaction.amount;
      balance = transaction.balance;
    });
    for (const transaction of transactions) {
      await updateTransaction(transaction, tx);
    }

    return entryUpdated;
  });
};
