import { TransportVehicleTransaction } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import { getCurrentBalance } from './common';
import prisma from '../../../../../middleware/prisma';

export const saveVehicleTransaction = async (
  entry: TransportVehicleTransaction,
): Promise<TransportVehicleTransaction | null> => {
  return prisma.$transaction(async (tx) => {
    const balance = await getCurrentBalance(entry.vehicleId, tx);
    entry.balance = balance + entry.amount
    return saveTransaction(entry, tx);
  });
};

export const saveTransaction = async (entry: TransportVehicleTransaction, tx: OmitPrismaClient): Promise<TransportVehicleTransaction|null> => {
  const entryCreated = await tx.transportVehicleTransaction.create({
    data: entry,
  });

  return entryCreated;
};
