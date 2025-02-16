
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getReservationsByVehicleId = async (vehicleId: number) => {
  const reservations = await prisma.transportVehicleReservation.findMany({
    where: {
      vehicleId,
    },
    include: {
      customer: true,
      rentalCycles: {
        include: {
          rentalCyclePayments: true,
        },
      },
    },
    orderBy: {
      reservationStart: 'desc',
    },
  });
  return reservations;
};
