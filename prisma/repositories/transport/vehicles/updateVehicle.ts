import { TransportVehicle, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateVehicle = async (entry: TransportVehicle): Promise<TransportVehicle | null> => {
  return await updateVehicleEntry(entry);
};

const updateVehicleEntry = async (entry: TransportVehicle): Promise<TransportVehicle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 update vehicle
    const entryUpdated = await tx.transportVehicle.update({
      where: {
        id: entry.id,
      },
      data: {
        vehicleName: entry.vehicleName,
        vehicleRegistration: entry.vehicleRegistration,
        model: entry.model,
        buyDate: entry.buyDate,
      },
    });

    return entryUpdated;
  });
};
