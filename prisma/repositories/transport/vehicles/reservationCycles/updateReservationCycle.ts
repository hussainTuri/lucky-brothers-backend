import { PrismaClient } from '@prisma/client';
import type { TransportVehicleReservationRentalCycle } from '@prisma/client';

const prisma = new PrismaClient();

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
      amountPaid: entry.amountPaid,
      comment: entry.comment,
    },
    include:{
      customer: true,
      rentalCyclePayments: true,
    }
  });

  return entryCreated;
};
