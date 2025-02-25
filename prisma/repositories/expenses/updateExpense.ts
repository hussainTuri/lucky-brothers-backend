import { Expense } from '@prisma/client';
import prisma from '../prismaClient';

export const updateExpense = async (entry: Expense): Promise<Expense | null> => {
  return await updateExpenseEntry(entry);
};

const updateExpenseEntry = async (entry: Expense): Promise<Expense | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save stock
    const entryUpdated = await tx.expense.update({
      where: {
        id: entry.id,
      },
      data: {
        amount: entry.amount,
        description: entry.description,
        expenseDate: entry.expenseDate,
        mode: entry.mode,
      },
    });

    return entryUpdated;
  });
};
