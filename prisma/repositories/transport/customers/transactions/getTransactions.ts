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

export const getTransportCustomerTransactions = async (
  customerId: number,
  options: QueryOptions,
  sort: QuerySort,
) => {
  if (!customerId) {
    throw new Error('Customer ID is required');
  }
  const [transactions, totalCount] = await Promise.all([
    prisma.transportCustomerTransaction.findMany({
      include: {
        rentalCycle: true,
      },
      where: {
        customerId,
      },
      orderBy: {
        ...(sort.id && { id: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportCustomerTransaction.count({
      where: {
        customerId,
      },
    }),
  ]);

  return { transactions, totalCount };
};
