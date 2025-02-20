import { PrismaClient, TransportVehicleTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import _ from 'lodash';

const prisma = new PrismaClient();

export const getVehicleTransaction = async (transactionId: number) => {
  if (_.isEmpty(transactionId)) {
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

export const getBalanceForTransaction = async (
  entry: TransportVehicleTransaction,
  tx: OmitPrismaClient,
) => {
  const lastTransaction = await tx.transportVehicleTransaction.findFirst({
    where: {
      id: {
        lt: entry.id,
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  if (lastTransaction) {
    return lastTransaction.balance + entry.amount;
  }
  return entry.amount;
};
