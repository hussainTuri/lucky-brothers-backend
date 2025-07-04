import { InvoiceStatusEnum } from '../../../lib/enums';
import prisma from '../../../middleware/prisma';

export const getDashboard = async () => {
  // current stock value
  const stockValueRs = await prisma.$queryRawUnsafe(
    `SELECT sum(pricePerItem * remainingQuantity) AS stockValue FROM ProductStock`, // We didn't use pricePerItemIncVat here because sale tax and purchase tax cancel each other out
  );
  const stockValue = (stockValueRs as any).length ? +(stockValueRs as any)[0].stockValue : 0;

  // Loan
  const loanRs = await prisma.$queryRawUnsafe(`SELECT sum(balance) AS loan FROM Customer`);
  const loan = (loanRs as any).length ? +(loanRs as any)[0].loan : 0;

  // Profit
  const profitRs = await prisma.$queryRawUnsafe(
    `SELECT sum(profit) AS totalProfit FROM Invoice WHERE statusId NOT IN (${InvoiceStatusEnum.Cancelled} , ${InvoiceStatusEnum.Refunded})`,
  );
  const profit = (profitRs as any).length ? +(profitRs as any)[0].totalProfit : 0;

  // Expenses
  const expensesRs = await prisma.$queryRawUnsafe(
    `SELECT sum(amount) AS totalExpenses FROM Expense`,
  );
  const totalExpenses = (expensesRs as any).length ? +(expensesRs as any)[0].totalExpenses : 0;

  // sum of profit from pending invoices - this will help to exclude same amount being calculated toward total assets twice
  // for example, we have stock value of 1000 and profit of 1000 and
  // loan of 500. Loan will include part of profit as well. So we need to extract that.
  const pendingProfitRs = await prisma.$queryRawUnsafe(
    `SELECT sum(profit) AS pendingProfit FROM Invoice WHERE statusId = ${InvoiceStatusEnum.Pending}`,
  );
  const pendingProfit = (pendingProfitRs as any).length
    ? +(pendingProfitRs as any)[0].pendingProfit
    : 0;

  const paidProfitRs = await prisma.$queryRawUnsafe(
    `SELECT sum(profit) AS paidProfit FROM Invoice WHERE statusId = ${InvoiceStatusEnum.Paid}`,
  );
  const paidProfit = (paidProfitRs as any).length ? +(paidProfitRs as any)[0].paidProfit : 0;

  return {
    stockValue,
    totalCustomersLoan: loan,
    totalProfit: profit,
    totalProfitFromPendingInvoices: pendingProfit,
    totalProfitFromPaidInvoices: paidProfit,
    totalExpenses,
  };
};
