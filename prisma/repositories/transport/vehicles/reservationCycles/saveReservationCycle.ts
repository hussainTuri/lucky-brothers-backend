import type { TransportVehicleReservationRentalCycle } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';

export const saveVehicleReservationCycle = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return await saveVehicleReservationCycleEntry(entry);
};

const saveVehicleReservationCycleEntry = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save vehicle
    const entryCreated = await tx.transportVehicleReservationRentalCycle.create({
      data: entry,
    });

    return entryCreated;
  });
};
