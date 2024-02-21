import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';

const prisma = new PrismaClient();

export const getCashes = async (options: QueryOptions, sort?: QuerySort) => {
  const [cashes, totalCount] = await Promise.all([
    await prisma.cash.findMany({
      orderBy: {
        ...(sort?.id && { id: sort?.id || 'desc' }),
        ...(sort?.createdAt && { createdAt: sort?.createdAt }),
        ...(sort?.cashDate && { cashDate: sort?.cashDate }),
      },
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.cash.count(),
  ]);

  return { cashes, totalCount };
};
