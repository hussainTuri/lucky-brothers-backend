import { DailyReport, PrismaClient } from '@prisma/client';
import { InvoiceStatusEnum } from '../../../../lib/enums';
import { TransactionModeEnum } from '../../../../lib/enums';

const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//   ],
// });

// prisma.$on('query', async (e: Prisma.QueryEvent) => {
//   console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const getPendingDailyReports = async () => {
  const registries = await prisma.dailyReport.findMany({
    select: {
      reportDate: true,
      closingBalance: true,
    },
  });

  const calculatedDays = registries.map((i) => i.reportDate.toISOString().slice(0, 10));

  const expenses = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(expenseDate, '%Y-%m-%d') AS reportDate,
    SUM(amount) AS totalAmount
    FROM
      Expense
    WHERE
      mode = ${TransactionModeEnum.Cash}
    GROUP BY
      DATE_FORMAT(expenseDate, '%Y-%m-%d');`)) as any;

  const sales = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(ip.createdAt, '%Y-%m-%d') AS reportDate,
    SUM(ip.amount) AS totalAmount
    FROM
      Invoice inv
      INNER JOIN InvoicePayment ip ON inv.id = ip.invoiceId
    WHERE
      inv.statusId NOT IN (${InvoiceStatusEnum.Cancelled}, ${InvoiceStatusEnum.Refunded}) AND
      ip.mode = ${TransactionModeEnum.Cash}
    GROUP BY
      DATE_FORMAT(ip.createdAt, '%Y-%m-%d')
    ORDER BY
      MIN(ip.createdAt) DESC;`)) as any;

  const cashes = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(cashDate, '%Y-%m-%d') AS reportDate,
    SUM(amount) AS totalAmount
    FROM
      Cash
    WHERE
      mode = ${TransactionModeEnum.Cash}
    GROUP BY
    DATE_FORMAT(cashDate, '%Y-%m-%d');`)) as any;

  const cashesOut = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(cashDate, '%Y-%m-%d') AS reportDate,
    SUM(amount) AS totalAmount
    FROM
      CashOut
    WHERE
      mode = ${TransactionModeEnum.Cash}
    GROUP BY
    DATE_FORMAT(cashDate, '%Y-%m-%d');`)) as any;

  const stocks = (await prisma.$queryRawUnsafe(`SELECT
    DATE_FORMAT(createdAt, '%Y-%m-%d') AS reportDate,
    SUM(originalQuantity * pricePerItem) AS totalAmount
    FROM
      ProductStock
    WHERE mode = ${TransactionModeEnum.Cash}
    GROUP BY
    DATE_FORMAT(createdAt, '%Y-%m-%d');`)) as any;

  const pendingDates = getDates().filter((i: any) => {
    return !calculatedDays.includes(i);
  });

  const pendingReports = pendingDates.map((date: any) => {
    let d = new Date(date);
    d.setDate(d.getDate() - 1);
    const salesAmount = sales.find((i: any) => i.reportDate === date)?.totalAmount?.toString() || 0;
    const expenseAmount =
      expenses.find((expense: any) => expense.reportDate === date)?.totalAmount?.toString() || 0;
    const cashAmount =
      cashes.find((cash: any) => cash.reportDate === date)?.totalAmount.toString() || 0;
    const cashOutAmount =
      cashesOut.find((cash: any) => cash.reportDate === date)?.totalAmount.toString() || 0;
    const stocksAmount =
      stocks.find((stock: any) => stock.reportDate === date)?.totalAmount?.toString() || 0;

    const dailyReport = {} as DailyReport;
    dailyReport.id = 0;
    dailyReport.reportDate = date;
    dailyReport.openingBalance = 0;
    dailyReport.sales = +salesAmount;
    dailyReport.expense = +expenseAmount;
    dailyReport.receiveCash = +cashAmount;
    dailyReport.payCash = +cashOutAmount;
    dailyReport.buyStock = +stocksAmount;
    dailyReport.closingBalance = 0;
    return dailyReport;
  });

  const prevBalance = registries.length
    ? registries[registries.length - 1].closingBalance.toString()
    : 0;

  return { pendingReports, lastClosingBalance: +prevBalance };
};

const getDates = () => {
  const startDate = '2024-02-23';
  const datesArray = [];
  const currentDate = new Date(startDate);

  while (currentDate <= new Date()) {
    const isoDate = currentDate.toISOString().split('T')[0];
    datesArray.push(isoDate);

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return datesArray;
};
