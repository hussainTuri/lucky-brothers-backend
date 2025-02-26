import type { TransportVehicleReservation } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';

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
        where: {
          deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
        },
        include: {
          rentalCyclePayments: {
            where: {
              deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
            },
          },
        },
      },
    },
  });

  return entryUpdated;
};
