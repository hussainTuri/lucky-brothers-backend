import { Prisma, PrismaClient } from '@prisma/client';
import { QuerySort, QueryOptions } from '../../../types';
const prisma = new PrismaClient();

export const getCustomers = async (options: QueryOptions, sort?: QuerySort) => {
  const [customers, totalCount] = await Promise.all([
    await prisma.customer.findMany({
      orderBy: {
        ...{ id: sort?.id || 'desc' },
        ...(sort?.createdAt && { createdAt: sort?.createdAt }),
      },
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.customer.count(),
  ]);

  return { customers, totalCount };
};
