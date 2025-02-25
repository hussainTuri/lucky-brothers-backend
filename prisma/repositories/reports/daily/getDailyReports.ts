import { QueryOptions, QuerySort } from '../../../../types';
import prisma from '../../../../middleware/prisma';

export const getDailyReports = async (options: QueryOptions, sort?: QuerySort) => {
  let orderBy = 'id desc';
  if (sort?.id) {
    orderBy = `id ${sort.id}`;
  } else if (sort?.monthYear) {
    orderBy = `reportDate ${sort.monthYear}`;
  }

  const [records, totalCount] = await Promise.all([
    prisma.$queryRawUnsafe(
      `SELECT * FROM DailyReport ORDER BY ${orderBy} LIMIT ${options?.skip || 0}, ${
        options?.take || 1000
      };`,
    ) as any,
    prisma.dailyReport.count(),
  ]);

  return {
    records,
    totalCount,
  };
};
