import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';

const prisma = new PrismaClient();

export const getExpenses = async (options: QueryOptions, sort?: QuerySort) => {
  const [expenses, totalCount] = await Promise.all([
    await prisma.expense.findMany({
      orderBy: {
        ...(sort?.id && { id: sort?.id || 'desc' }),
        ...(sort?.createdAt && { createdAt: sort?.createdAt }),
        ...(sort?.expenseDate && { expenseDate: sort?.expenseDate }),
      },
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.expense.count(),
  ]);

  return { expenses, totalCount };
};
