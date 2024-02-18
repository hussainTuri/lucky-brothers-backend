import { PrismaClient } from '@prisma/client';
import type { MonthlyProfit } from '@prisma/client';

const prisma = new PrismaClient();

export const saveMonthlyProfit = async (entry: MonthlyProfit): Promise<MonthlyProfit | null> => {
  return await saveMonthlyProfitEntry(entry);
};

const saveMonthlyProfitEntry = async (entry: MonthlyProfit): Promise<MonthlyProfit | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save stock
    const entryCreated = await tx.monthlyProfit.create({
      data: entry,
    });

    return entryCreated;
  });
};
