import { Prisma, PrismaClient } from '@prisma/client';
import { QuerySort, QueryOptions } from '../../../../../types';
const prisma = new PrismaClient();
import _ from 'lodash';

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

export const getVehicleTransactions = async (
  vehicleId: number,
  options: QueryOptions,
  sort: QuerySort,
) => {
  if (!vehicleId) {
    throw new Error('Vehicle ID is required');
  }
  const [transactions, totalCount] = await Promise.all([
    prisma.transportVehicleTransaction.findMany({
      include: {
        customerTransaction: {
          include: {
            customer: true,
          },
        },
        bank: true,
      },
      where: {
        vehicleId,
      },
      orderBy: {
        ...(sort.id && { id: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportVehicleTransaction.count({
      where: {
        vehicleId,
      },
    }),
  ]);

  return { transactions, totalCount };
};
