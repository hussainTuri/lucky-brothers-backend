import { Prisma } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../../types';
import prisma from '../../../../middleware/prisma';

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
