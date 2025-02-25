import { PrismaClient } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import _ from 'lodash';
import {
  getPreviousTransaction,
  getTransactionsAfterId,
  getVehicleTransactionByVehicle,
  updateTransaction,
} from './common';

const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//   ],
// });
// prisma.$on('query', async (e: Prisma.QueryEvent) => {
//   console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
//   console.log('------------------------------------------------------\n');
//   console.log(`${e.query} duration: ${e.duration / 100} s`);
// });

export const deleteVehicleTransaction = async (
  vehicleIdentifier: string | number,
  id: string | number,
) => {
  const transactionId = Number(id);
  const vehicleId = Number(vehicleIdentifier);
  const entry = await getVehicleTransactionByVehicle(vehicleId, transactionId);

  if (_.isEmpty(entry)) {
    throw new Error(`Transaction with id ${id} not found.`);
  }

  return prisma.$transaction(async (tx) => {
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
  });
};

const deleteTransaction = async (vehicleId: number, id: number, tx: OmitPrismaClient) => {
  return await tx.transportVehicleTransaction.delete({
    where: {
      id,
      vehicleId,
    },
  });
};
