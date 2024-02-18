import { PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';

const prisma = new PrismaClient();

export const getMonthlyProfits = async (options: QueryOptions, sort?: QuerySort) => {
  let orderBy = '';
  if (sort?.id) {
    orderBy = `id ${sort.id}`;
  } else if (sort?.createdAt) {
    orderBy = `createdAt ${sort.createdAt}`;
  } else if (sort?.monthYear) {
    orderBy = `STR_TO_DATE(concat('01-', monthYear), '%d-%m-%Y') ${sort.monthYear}`;
  }

  const [records, totalCount, profit] = await Promise.all([
    prisma.$queryRawUnsafe(
      `SELECT * FROM MonthlyProfit ORDER BY ${orderBy} LIMIT ${options?.skip || 0}, ${
        options?.take || 1000
      };`,
    ) as any,
    prisma.$queryRawUnsafe(`SELECT COUNT(*) total FROM MonthlyProfit;`) as any,
    prisma.$queryRawUnsafe(
      `SELECT SUM(profit) - sum(expense) totalNetProfit FROM MonthlyProfit;`,
    ) as any,
  ]);

  return {
    records,
    totalCount: +totalCount[0].total.toString(),
    totalNetProfit: +profit[0].totalNetProfit.toString(),
  };
};
