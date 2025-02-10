import { PrismaClient } from '@prisma/client';
import type { TransportVehicle } from '@prisma/client';

const prisma = new PrismaClient();

export const saveVehicle= async (entry: TransportVehicle): Promise<TransportVehicle | null> => {
  return await saveVehicleEntry(entry);
};

const saveVehicleEntry = async (entry: TransportVehicle): Promise<TransportVehicle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save vehicle
    const entryCreated = await tx.transportVehicle.create({
      data: entry,
    });

    return entryCreated;
  });
};
