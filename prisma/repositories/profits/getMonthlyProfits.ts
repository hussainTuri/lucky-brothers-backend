import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';

const prisma = new PrismaClient();

export const getMonthlyProfits = async (options: QueryOptions, sort?: QuerySort) => {
  const [records, totalCount] = await Promise.all([
    await prisma.monthlyProfit.findMany({
      orderBy: {
        ...( sort?.id && {id: sort?.id || 'desc' }),
        ...(sort?.createdAt && { createdAt: sort?.createdAt }),
      },
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.monthlyProfit.count(),
  ]);

  return { records, totalCount };
};
