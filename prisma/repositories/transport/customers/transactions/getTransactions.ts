import { QuerySort, QueryOptions } from '../../../../../types';
import prisma from '../../../../../middleware/prisma';

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
        rentalCycle: {
          where: {
            deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
          },
        },
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
