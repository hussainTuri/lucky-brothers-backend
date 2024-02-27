import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';

const prisma = new PrismaClient();

export const getExpenses = async (options: QueryOptions, sort?: QuerySort) => {
  let orderBy: { [key: string]: 'asc' | 'desc' }[] = [];

  if (sort) {
    if (sort.id) {
      orderBy.push({ id: sort.id });
    }
    if (sort.createdAt) {
      orderBy.push({ createdAt: sort.createdAt });
    }
    if (sort.expenseDate) {
      orderBy.push({ expenseDate: sort.expenseDate });
      orderBy.push({ id: sort.expenseDate });
    }
  }

  const [expenses, totalCount] = await Promise.all([
    await prisma.expense.findMany({
      orderBy,
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.expense.count(),
  ]);

  return { expenses, totalCount };
};
