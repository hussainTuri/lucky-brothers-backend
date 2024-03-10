import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';

const prisma = new PrismaClient();

export const getCashesOut = async (options: QueryOptions, sort?: QuerySort) => {
  let orderBy: { [key: string]: 'asc' | 'desc' }[] = [];

  if (sort) {
    if (sort.id) {
      orderBy.push({ id: sort.id });
    }
    if (sort.createdAt) {
      orderBy.push({ createdAt: sort.createdAt });
    }
    if (sort.cashDate) {
      orderBy.push({ cashDate: sort.cashDate });
      orderBy.push({ id: sort.cashDate });
    }
  }

  const [cashes, totalCount] = await Promise.all([
    await prisma.cashOut.findMany({
      orderBy,
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.cashOut.count(),
  ]);

  return { cashes, totalCount };
};
