import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../../types';

const prisma = new PrismaClient();

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
      orderBy,
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportVehicle.count(),
  ]);

  return { vehicles, totalCount };
};
