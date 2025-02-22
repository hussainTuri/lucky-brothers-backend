import { TransportVehicleTransaction, PrismaClient } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import { getBalanceForTransaction } from './common';

const prisma = new PrismaClient();

export const saveVehicleTransaction = async (
  entry: TransportVehicleTransaction,
): Promise<TransportVehicleTransaction | null> => {
  return prisma.$transaction(async (tx) => {
    entry.balance = await getBalanceForTransaction(entry, tx);
    return saveTransaction(entry, tx);
  });
};

const saveTransaction = async (entry: TransportVehicleTransaction, tx: OmitPrismaClient): Promise<TransportVehicleTransaction|null> => {
  const entryCreated = await tx.transportVehicleTransaction.create({
    data: entry,
  });

  return entryCreated;
};
