import { TransportVehicleTransaction, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const saveVehicleTransaction = async (
  entry: TransportVehicleTransaction,
): Promise<TransportVehicleTransaction | null> => {
  const entryCreated = await prisma.transportVehicleTransaction.create({
    data: entry,
  });

  return entryCreated;
};
