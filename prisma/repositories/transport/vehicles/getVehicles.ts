import { Prisma, PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../../types';

// const prisma = new PrismaClient();
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});
prisma.$on('query', async (e: Prisma.QueryEvent) => {
  console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
  console.log('------------------------------------------------------\n');
  console.log(`${e.query} duration: ${e.duration/100} s`);
});


export const getVehicles = async (options: QueryOptions, sort?: QuerySort) => {
  let orderBy: { [key: string]: 'asc' | 'desc' }[] = [];

  if (sort) {
    if (sort.id) {
      orderBy.push({ id: sort.id });
    }
    if (sort.createdAt) {
      orderBy.push({ createdAt: sort.createdAt });
    }
  }

  const [vehicles, totalCount] = await Promise.all([
    await prisma.transportVehicle.findMany({
      include: {
        reservations: {
          orderBy: {
            id: 'desc',
          },
          where: {
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
          }
        },
      },
      orderBy,
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportVehicle.count(),
  ]);

  return { vehicles, totalCount };
};
