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

export const getCustomer = async (id: number | string) => {
  const customer = await prisma.transportCustomer.findFirstOrThrow({
    where: {
      id: Number(id),
    },
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
  return customer;
};
