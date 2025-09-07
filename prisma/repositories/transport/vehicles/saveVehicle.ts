import type { TransportVehicle } from '@prisma/client';
import prisma from '../../../../middleware/prisma';

export const saveVehicle= async (entry: TransportVehicle): Promise<TransportVehicle | null> => {
  return await saveVehicleEntry(entry);
};

const saveVehicleEntry = async (entry: TransportVehicle): Promise<TransportVehicle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save vehicle
    const data: any = { ...entry };
    if (entry.mulkiyaRegistrationExpiry !== undefined) {
      data.mulkiyaRegistrationExpiry = entry.mulkiyaRegistrationExpiry || null;
    }
    const entryCreated = await tx.transportVehicle.create({
      data,
    });

    return entryCreated;
  });
};
