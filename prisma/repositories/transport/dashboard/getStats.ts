import { TransportVehicleTransactionTypes } from '../../../../lib/enums';
import prisma from '../../../../middleware/prisma';
import { QueryOptions, QuerySort } from '../../../../types';

export interface TransportDashboardMonthlyStatRow {
  month: string; // YYYY-MM-01
  rent: number;
  customerPayments: number;
  expenses: number;
  balance: number;
}

export interface TransportDashboardMonthlyStatsResponse {
  monthlyStats: TransportDashboardMonthlyStatRow[];
  totalCount: number;
  totalRent: number;
  totalCustomerPayments: number;
  totalExpenses: number;
  totalBalance: number;
}

export async function getTransportMonthlyStatsDashboard(
  options: QueryOptions,
  sort?: QuerySort,
): Promise<TransportDashboardMonthlyStatsResponse> {
  const skip = options?.skip ?? 0;
  const take = options?.take ?? 50;

  // Rent per month (SQL month bucket)
  const rentRows = await prisma.$queryRaw<Array<{ month: string; total: bigint | number | null }>>`
    SELECT DATE_FORMAT(rentFrom, '%Y-%m-01') AS month, SUM(amount) AS total
    FROM TransportVehicleReservationRentalCycle
    WHERE deleted IS NULL
    GROUP BY month
  `;
  const rentByMonth = new Map<string, number>();
  for (const r of rentRows) rentByMonth.set(r.month, Number(r.total ?? 0));

  // Payments per month (SQL month bucket)
  const payRows = await prisma.$queryRaw<Array<{ month: string; total: bigint | number | null }>>`
    SELECT DATE_FORMAT(paymentDate, '%Y-%m-01') AS month, SUM(amount) AS total
    FROM TransportVehicleReservationRentalCyclePayment
    WHERE deleted IS NULL
    GROUP BY month
  `;
  const payByMonth = new Map<string, number>();
  for (const p of payRows) payByMonth.set(p.month, Number(p.total ?? 0));

  // Expenses per month from vehicle transactions of type 4 (SQL month bucket)
  const EXPENSE_TYPE = TransportVehicleTransactionTypes.Expense;
  const expRows = await prisma.$queryRaw<Array<{ month: string; total: bigint | number | null }>>`
    SELECT DATE_FORMAT(createdAt, '%Y-%m-01') AS month, SUM(amount) AS total
    FROM TransportVehicleTransaction
    WHERE deleted IS NULL AND transactionTypeId = ${EXPENSE_TYPE}
    GROUP BY month
  `;
  const expByMonth = new Map<string, number>();
  for (const e of expRows) expByMonth.set(e.month, Number(e.total ?? 0));

  // Merge months
  const months = new Set<string>([
    ...rentByMonth.keys(),
    ...payByMonth.keys(),
    ...expByMonth.keys(),
  ]);

  const monthsArr = [...months];
  const isAsc = sort?.month === 'asc';
  monthsArr.sort((a, b) => (a < b ? (isAsc ? -1 : 1) : a > b ? (isAsc ? 1 : -1) : 0));

  const totalCount = monthsArr.length;
  const pageMonths = monthsArr.slice(skip, skip + take);

  // Build page rows (no totals accumulation here)
  const rows = pageMonths.map((m) => {
    const rent = rentByMonth.get(m) ?? 0;
    const customerPayments = payByMonth.get(m) ?? 0;
    const expenses = expByMonth.get(m) ?? 0;
    const balance = rent + customerPayments + expenses; // expenses are negative numbers
    return { month: m, rent, customerPayments, expenses, balance };
  });

  // Grand totals across all months
  const totalRent = Array.from(rentByMonth.values()).reduce((a, b) => a + b, 0);
  const totalCustomerPayments = Array.from(payByMonth.values()).reduce((a, b) => a + b, 0);
  const totalExpenses = Array.from(expByMonth.values()).reduce((a, b) => a + b, 0);
  const totalBalance = totalRent + totalCustomerPayments + totalExpenses; // expenses are negative numbers

  return {
    monthlyStats: rows,
    totalCount,
    totalRent,
    totalCustomerPayments,
    totalExpenses,
    totalBalance,
  };
}
