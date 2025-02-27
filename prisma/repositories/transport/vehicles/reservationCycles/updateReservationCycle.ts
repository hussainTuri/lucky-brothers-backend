import type { TransportVehicleReservationRentalCycle } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';

export const updateVehicleReservationCycle = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  const entryCreated = await prisma.transportVehicleReservationRentalCycle.update({
    where:{
      id: entry.id,
    },
    data: {
      vehicleReservationId: entry.vehicleReservationId,
      customerId: entry.customerId,
      rentFrom: entry.rentFrom,
      rentTo: entry.rentTo,
      amount: entry.amount,
      comment: entry.comment,
    },
  });

  return entryCreated;
};
