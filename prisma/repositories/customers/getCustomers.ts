import { QuerySort, QueryOptions } from '../../../types';
import prisma from '../../../middleware/prisma';

export const getCustomers = async (options: QueryOptions, sort?: QuerySort) => {
  const [customers, totalCount] = await Promise.all([
    await prisma.customer.findMany({
      orderBy: {
        ...(sort?.id && { id: sort?.id || 'desc' }),
        ...(sort?.createdAt && { createdAt: sort?.createdAt }),
        ...(sort?.customerName && { customerName: sort?.customerName }),
      },
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.customer.count(),
  ]);

  return { customers, totalCount };
};
