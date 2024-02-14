import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getExpenses = async () => {
  const expenses = await prisma.expense.findMany({
    orderBy: {
      id: 'desc',
    },
  });

  return expenses;
};
