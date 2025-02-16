import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//   ],
// });
// prisma.$on('query', async (e: Prisma.QueryEvent) => {
//   console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
//   console.log('------------------------------------------------------\n');
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const getVehicle = async (id: number | string) => {
  const vehicle = await prisma.transportVehicle.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    // add last active reservation
    include: {
      reservations: {
        include: {
          customer: true,
          rentalCycles: {
            include: {
              rentalCyclePayments: true,
            },
          },
        },
        orderBy: [
          {
            reservationEnd: 'desc',
          },
          {
            reservationStart: 'desc',
          },
        ],
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
