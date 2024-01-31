import { Prisma, PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../../types';

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
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const getTransactions = async (options: QueryOptions, sort: QuerySort) => {
  const where: Prisma.CustomerTransactionWhereInput = {
    AND: [
      // Start Date condition
      ...(options?.startDate ? [{ createdAt: { gte: options.startDate } }] : []),
      // End Date condition
      ...(options?.endDate ? [{ createdAt: { lte: options.endDate } }] : []),
    ],
  };
  const [transactions, totalCount] = await Promise.all([
    prisma.customerTransaction.findMany({
      include: {
        customer: true,
      },
      where,
      orderBy: {
        ...(sort.id && { id: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.customerTransaction.count({
      where,
    }),
  ]);

  return { transactions, totalCount };
};
