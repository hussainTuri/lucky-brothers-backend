import prisma from '../../../../../middleware/prisma';

export const getReservationsByVehicleId = async (vehicleId: number) => {
  const reservations = await prisma.transportVehicleReservation.findMany({
    where: {
      vehicleId,
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

  return reservation;
};
