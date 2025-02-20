import { PrismaClient } from '@prisma/client';
import type { TransportVehicleReservation } from '@prisma/client';

const prisma = new PrismaClient();

export const updateVehicleReservation = async (
  entry: TransportVehicleReservation,
): Promise<TransportVehicleReservation | null> => {
  const entryUpdated = await prisma.transportVehicleReservation.update({
    where: {
      id: entry.id,
    },
    data: {
      customerId: entry.customerId,
      vehicleId: entry.vehicleId,
      reservationStart: entry.reservationStart,
      reservationEnd: entry.reservationEnd,
      monthlyRate: entry.monthlyRate,
      comment: entry.comment,
    },
    include: {
      customer: true,
      rentalCycles: {
        include: {
          rentalCyclePayments: true,
        },
      },
    },
  });

  return entryUpdated;
};
