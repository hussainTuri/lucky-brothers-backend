import { PrismaClient } from '@prisma/client';
import { QuerySort, QueryOptions } from '../../../../types';
const prisma = new PrismaClient();

export const getTransportCustomers = async (options: QueryOptions, sort?: QuerySort) => {
  const [customers, totalCount] = await Promise.all([
    await prisma.transportCustomer.findMany({
      orderBy: {
        ...(sort?.id && { id: sort?.id || 'desc' }),
        ...(sort?.createdAt && { createdAt: sort?.createdAt }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.customer.count(),
  ]);

  const transactionTypes = await prisma.transportCustomerTransactionType.findMany();

  return { customers, totalCount, additionalData: { transactionTypes } };
};
