import prisma from '../../../../middleware/prisma';

export const getVehicle = async (id: number | string) => {
  const vehicle = await prisma.transportVehicle.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    // add last active reservation
    include: {
      reservations: {
        where: {
          deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
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
          id: 'desc',
        },
      },
    },
  });
  return vehicle;
};

export const getVehicleActiveReservation = async (vehicleId: number) => {
  const reservations = await prisma.transportVehicleReservation.findMany({
    where: {
      //  WHERE vehicleId = ? AND reservationStart <= ? AND (reservationEnd >= ? OR reservationEnd IS NULL)
      vehicleId,
      reservationStart: {
        lte: new Date(),
      },
      OR: [
        {
          reservationEnd: {
            gte: new Date(),
          },
        },
        {
          reservationEnd: {
            equals: null,
          },
        },
      ],
    },
    orderBy: {
      id: 'desc',
    },
    take: 1,
  });
  if (reservations.length) {
    return reservations[0];
  }
  return null;
};
