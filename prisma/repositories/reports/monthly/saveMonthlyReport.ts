import type { MonthlyReport } from '@prisma/client';
import prisma from '../../../../middleware/prisma';

export const saveMonthlyReport = async (entry: MonthlyReport): Promise<MonthlyReport | null> => {
  return await saveMonthlyReportEntry(entry);
};

const saveMonthlyReportEntry = async (entry: MonthlyReport): Promise<MonthlyReport | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save entry
    const entryCreated = await tx.monthlyReport.create({
      data: entry,
    });

    return entryCreated;
  });
};
