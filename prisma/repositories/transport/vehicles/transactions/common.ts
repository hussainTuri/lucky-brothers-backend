import { PrismaClient, TransportVehicleTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import _ from 'lodash';

const prisma = new PrismaClient();

export const getVehicleTransaction = async (transactionId: number) => {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }
  const transaction = await prisma.transportVehicleTransaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      customerTransaction: {
        include: {
          customer: true,
        },
      },
    },
  });

  return transaction;
};

export const getVehicleTransactionByVehicle = async (vehicleId: number, transactionId: number) => {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }
  const transaction = await prisma.transportVehicleTransaction.findUnique({
    where: {
      id: transactionId,
      vehicleId: vehicleId,
    },
    include: {
      customerTransaction: {
        include: {
          customer: true,
        },
      },
    },
  });

  return transaction;
};

export const getPreviousTransaction = async (id: number, tx: OmitPrismaClient) => {
  const lastTransaction = await tx.transportVehicleTransaction.findFirst({
    where: {
      id: {
        lt: id,
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  return lastTransaction;
};

export const getTransactionsAfterId = async (
  id: number,
  tx: OmitPrismaClient,
): Promise<TransportVehicleTransaction[]> => {
  return tx.transportVehicleTransaction.findMany({
    where: {
      id: {
        gt: id,
      },
    },
  });
};

/**
 * Get balance for a vehicle based on the last transaction
 *
 * @param vehicleId number
 * @returns
 */
export const getCurrentBalance = async (vehicleId: number, tx: OmitPrismaClient) => {
  const lastTransaction = await tx.transportVehicleTransaction.findFirst({
    where: {
      vehicleId: vehicleId,
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
 * For a given vehicle transaction, get the balance from the previous transaction
 *
 * @param entry number
 * @param tx
 * @returns
 */
export const getBalanceForTransaction = async (
  entry: TransportVehicleTransaction,
  tx: OmitPrismaClient,
) => {
  const lastTransaction = await getPreviousTransaction(entry.id, tx);

  if (lastTransaction) {
    return lastTransaction.balance + entry.amount;
  }
  return entry.amount;
};

export const updateTransaction = async (
  entry: TransportVehicleTransaction,
  tx: OmitPrismaClient,
): Promise<TransportVehicleTransaction | null> => {
  const entryUpdated = await tx.transportVehicleTransaction.update({
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
