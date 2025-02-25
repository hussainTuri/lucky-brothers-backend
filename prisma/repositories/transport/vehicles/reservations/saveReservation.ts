import type { TransportVehicleReservation } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';

export const saveVehicleReservation = async (
  entry: TransportVehicleReservation,
): Promise<TransportVehicleReservation | null> => {
  return await saveVehicleReservationEntry(entry);
};

const saveVehicleReservationEntry = async (
  entry: TransportVehicleReservation,
): Promise<TransportVehicleReservation | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save vehicle
    const entryCreated = await tx.transportVehicleReservation.create({
      data: entry,
      include:{
        customer: true,
        rentalCycles: {
          include: {
            rentalCyclePayments: true,
          }
        }
      }
    });

    return entryCreated;
  });
};
