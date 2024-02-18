import { MonthlyProfit, PrismaClient } from '@prisma/client';
import { InvoiceStatusEnum } from '../../../lib/enums';

const prisma = new PrismaClient();

export const getPendingMonthlyProfits = async () => {
  const profits = await prisma.monthlyProfit.findMany({
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
    const monthlyProfit = {} as MonthlyProfit;
    monthlyProfit.id = 0;
    monthlyProfit.monthYear = sale.monthYear;
    monthlyProfit.sales = +sale.totalAmount;
    monthlyProfit.expense =
      +expenses.find((expense: any) => expense.monthYear === sale.monthYear)?.totalAmount || 0;
    monthlyProfit.profit =
      +profit.find((profit: any) => profit.monthYear === sale.monthYear)?.totalAmount || 0;
    return monthlyProfit;
  });

  return data;
};
