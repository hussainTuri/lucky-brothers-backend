import { PrismaClient } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import _ from 'lodash';
import { getPreviousTransaction, getTransactionsAfterId, getVehicleTransaction } from './common';

const prisma = new PrismaClient();

export const deleteVehicleTransaction = async (id: string | number) => {
  const transactionId = Number(id);
  const entry = getVehicleTransaction(transactionId);

  if (_.isEmpty(entry)) {
    throw new Error(`Transaction with id ${id} not found`);
  }

  return prisma.$transaction(async (tx) => {
    // 1. get previous transaction
    const previousTransaction = await getPreviousTransaction(transactionId, tx);

    // 2. delete intended transaction
    await deleteTransaction(transactionId, tx);

    // 3. Update balance in all transactions after this transaction
    let balance = previousTransaction?.balance ?? 0;
    const transactions = await getTransactionsAfterId(transactionId, tx);
    transactions.forEach((transaction) => {
      transaction.balance = balance + transaction.balance;
      balance = transaction.balance;
    });
  });
};

const deleteTransaction = async (id: number, tx: OmitPrismaClient) => {
  return await prisma.transportCustomerTransaction.delete({
    where: {
      id,
    },
  });
};
