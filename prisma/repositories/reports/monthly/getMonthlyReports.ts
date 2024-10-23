import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../../types';

const prisma = new PrismaClient();

export const getMonthlyReports = async (options: QueryOptions, sort?: QuerySort) => {
  let orderBy = 'id desc';
  if (sort?.id) {
    orderBy = `id ${sort.id}`;
  } else if (sort?.createdAt) {
    orderBy = `createdAt ${sort.createdAt}`;
  } else if (sort?.monthYear) {
    orderBy = `STR_TO_DATE(concat('01-', monthYear), '%d-%m-%Y') ${sort.monthYear}`;
  }

  const [records, totalCount, profit] = await Promise.all([
    prisma.$queryRawUnsafe(
      `SELECT * FROM MonthlyReport ORDER BY ${orderBy} LIMIT ${options?.skip || 0}, ${
        options?.take || 1000
      };`,
    ) as any,
    prisma.monthlyReport.count(),
    prisma.$queryRawUnsafe(
      `SELECT SUM(profit) - sum(expense) totalNetProfit FROM MonthlyReport;`,
    ) as any,
  ]);

  return {
    records,
    totalCount,
    totalNetProfit:
      profit.length && profit[0].totalNetProfit ? +profit[0].totalNetProfit.toString() : 0,
  };
};
