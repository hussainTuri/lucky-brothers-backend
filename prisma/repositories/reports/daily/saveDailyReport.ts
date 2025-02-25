import type { DailyReport } from '@prisma/client';
import prisma from '../../prismaClient';

export const saveDailyReport = async (entry: DailyReport): Promise<DailyReport | null> => {
  return await saveDailyReportEntry(entry);
};

const saveDailyReportEntry = async (entry: DailyReport): Promise<DailyReport | null> => {
  return prisma.$transaction(async (tx) => {
    // 1. get last closing balance
    const lastEntry = await tx.dailyReport.findFirst({
      orderBy: {
        reportDate: 'desc',
      },
    });

    // 2 save report
    const entryCreated = await tx.dailyReport.create({
      data: {
        reportDate: entry.reportDate,
        openingBalance: lastEntry?.closingBalance ?? 0,
        sales: entry.sales,
        expense: entry.expense,
        receiveCash: entry.receiveCash,
        payCash: entry.payCash,
        buyStock: entry.buyStock,
        closingBalance:
          (lastEntry?.closingBalance ?? 0) +
          entry.sales -
          entry.expense +
          entry.receiveCash -
          entry.payCash -
          entry.buyStock,
        description: entry.description,
      },
    });

    return entryCreated;
  });
};
