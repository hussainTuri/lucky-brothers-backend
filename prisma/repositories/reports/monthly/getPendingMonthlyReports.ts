import { MonthlyReport } from '@prisma/client';
import { InvoiceStatusEnum } from '../../../../lib/enums';
import prisma from '../../prismaClient';

export const getPendingMonthlyReports = async () => {
  const profits = await prisma.monthlyReport.findMany({
    select: {
      monthYear: true,
    },
  });

  const calculatedMonths = profits.map((profit) => profit.monthYear);

  const expenses = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(expenseDate, '%m-%Y') AS monthYear,
    SUM(amount) AS totalAmount
    FROM
      Expense
    GROUP BY
      DATE_FORMAT(expenseDate, '%m-%Y');`)) as any;

  const sales = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(createdAt, '%m-%Y') AS monthYear,
    SUM(totalAmount) AS totalAmount
    FROM
      Invoice
    WHERE
      statusId NOT IN (${InvoiceStatusEnum.Cancelled}, ${InvoiceStatusEnum.Refunded})
    GROUP BY
      DATE_FORMAT(createdAt, '%m-%Y')
    ORDER BY
      MIN(createdAt) DESC;`)) as any;

  const profit = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(createdAt, '%m-%Y') AS monthYear,
    SUM(profit) AS totalAmount
    FROM
      Invoice
    WHERE
      statusId NOT IN (${InvoiceStatusEnum.Cancelled}, ${InvoiceStatusEnum.Refunded})
    GROUP BY
    DATE_FORMAT(createdAt, '%m-%Y');`)) as any;

  const pendingProfits = sales.filter((sale: any) => {
    return !calculatedMonths.includes(sale.monthYear);
  });

  const data = pendingProfits.map((sale: any) => {
    const monthlyReport = {} as MonthlyReport;
    monthlyReport.id = 0;
    monthlyReport.monthYear = sale.monthYear;
    monthlyReport.sales = +sale.totalAmount;
    monthlyReport.expense =
      +expenses.find((expense: any) => expense.monthYear === sale.monthYear)?.totalAmount || 0;
    monthlyReport.profit =
      +profit.find((profit: any) => profit.monthYear === sale.monthYear)?.totalAmount || 0;
    return monthlyReport;
  });

  return data;
};
