import { OmitPrismaClient } from '../../../../../types';
import _ from 'lodash';
import {
  getPreviousTransaction,
  getTransactionsAfterId,
  getVehicleTransactionByVehicle,
  updateTransaction,
} from './common';
import prisma from '../../../../../middleware/prisma';

export const deleteVehicleTransaction = async (
  vehicleIdentifier: string | number,
  id: string | number,
) => {
  return prisma.$transaction(async (tx) => {
    return deleteVehicleTransactionDbTransaction(vehicleIdentifier, id, tx);
  });
};

export const deleteVehicleTransactionDbTransaction = async (
  vehicleIdentifier: string | number,
  id: string | number,
  tx: OmitPrismaClient,
) => {
  const transactionId = Number(id);
  const vehicleId = Number(vehicleIdentifier);
  const entry = await getVehicleTransactionByVehicle(vehicleId, transactionId);

  if (_.isEmpty(entry)) {
    throw new Error(`Transaction with id ${id} not found.`);
  }

  // 1. get previous transaction
  const previousTransaction = await getPreviousTransaction(vehicleId, transactionId, tx);

  // 2. delete intended transaction
  await deleteTransaction(vehicleId, transactionId, tx);

  // 3. Update balance in all transactions after this transaction
  let balance = previousTransaction?.balance ?? 0;
  const transactions = await getTransactionsAfterId(vehicleId, transactionId, tx);
  transactions.forEach((transaction) => {
    transaction.balance = balance + transaction.amount;
    balance = transaction.balance;
  });
  for (const transaction of transactions) {
    await updateTransaction(transaction, tx);
  }
};

const deleteTransaction = async (vehicleId: number, id: number, tx: OmitPrismaClient) => {
  return await tx.transportVehicleTransaction.delete({
    where: {
      id,
      vehicleId,
    },
  });
};
