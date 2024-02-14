import { PrismaClient } from '@prisma/client';
import type { Expense } from '@prisma/client';

const prisma = new PrismaClient();

export const saveExpense = async (entry: Expense): Promise<Expense | null> => {
  return await saveExpenseEntry(entry);
};

const saveExpenseEntry = async (entry: Expense): Promise<Expense | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save stock
    const entryCreated = await tx.expense.create({
      data: entry,
    });

    return entryCreated;
  });
};
