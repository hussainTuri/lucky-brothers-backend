import { TransportVehicleTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import { getCurrentBalance } from './common';
import prisma from '../../../../../middleware/prisma';
import { TransportVehicleTransactionTypes } from '../../../../../lib/enums';

export const saveVehicleTransaction = async (
  entry: TransportVehicleTransaction,
): Promise<TransportVehicleTransaction | null> => {
  return prisma.$transaction(async (tx) => {
    const balance = await getCurrentBalance(entry.vehicleId, tx);
    entry.balance = balance + entry.amount;

    if (entry.transactionTypeId === TransportVehicleTransactionTypes.BankInstallment) {
      entry.balance = balance;
    }
    return saveTransaction(entry, tx);
  });
};

export const saveTransaction = async (
  entry: TransportVehicleTransaction,
  tx: OmitPrismaClient,
): Promise<TransportVehicleTransaction | null> => {
  const entryCreated = await tx.transportVehicleTransaction.create({
    data: entry,
  });

  return entryCreated;
};
