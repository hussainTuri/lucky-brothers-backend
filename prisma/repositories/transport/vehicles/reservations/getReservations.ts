import prisma from '../../../../../middleware/prisma';

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

export const getReservation = async (id: number) => {
  const reservation = await prisma.transportVehicleReservation.findUniqueOrThrow({
    where: {
      id,
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

  return reservation;
};
