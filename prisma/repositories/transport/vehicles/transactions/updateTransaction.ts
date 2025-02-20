import { PrismaClient, TransportVehicleTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import { getBalanceForTransaction, getTransactionsAfterId } from './common';

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
      transaction.balance = balance + transaction.balance;
      balance = transaction.balance;
    });

    return entryUpdated;
  });
};

const updateTransaction = async (
  entry: TransportVehicleTransaction,
  tx: OmitPrismaClient,
): Promise<TransportVehicleTransaction | null> => {
  const entryUpdated = await prisma.transportVehicleTransaction.update({
    where: {
      id: entry.id,
    },
    data: {
      //  transactionTypeId÷: entry.transactionTypeId,   // Don't allow to update transaction type
      bankId: entry.bankId,
      amount: entry.amount,
      balance: entry.balance,
      comment: entry.comment,
    },
  });

  return entryUpdated;
};
