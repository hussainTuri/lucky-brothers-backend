import prisma from '../../../../../middleware/prisma';
import { QuerySort, QueryOptions } from '../../../../../types';

export const getVehicleTransactions = async (
  vehicleId: number,
  options: QueryOptions,
  sort: QuerySort,
) => {
  if (!vehicleId) {
    throw new Error('Vehicle ID is required');
  }
  const [transactions, totalCount] = await Promise.all([
    prisma.transportVehicleTransaction.findMany({
      include: {
        customerTransaction: {
          include: {
            customer: true,
          },
        },
        bank: true,
      },
      where: {
        vehicleId,
      },
      orderBy: {
        ...(sort.id && { id: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportVehicleTransaction.count({
      where: {
        vehicleId,
      },
    }),
  ]);

  return { transactions, totalCount };
};
