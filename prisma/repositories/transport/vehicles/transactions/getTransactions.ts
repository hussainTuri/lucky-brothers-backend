import { TransportVehicleTransactionTypes } from '../../../../../lib/enums/transportVehicle';
import prisma from '../../../../../middleware/prisma';
import { QuerySort, QueryOptions } from '../../../../../types';

export const getVehicleTransactions = async (
  vehicleId: number,
  options: QueryOptions,
  sort: QuerySort,
) => {
  if (!vehicleId) {
    throw new Error('Vehicle ID is required');
  }
  const [transactions, totalCount] = await Promise.all([
    prisma.transportVehicleTransaction.findMany({
      include: {
        customerTransaction: {
          where: {
            deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
          },
          include: {
            customer: true,
          },
        },
        bank: true,
      },
      where: {
        vehicleId,
      },
      orderBy: {
        ...(sort.id && { id: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportVehicleTransaction.count({
      where: {
        vehicleId,
      },
    }),
  ]);

  // Get banks to be used in loans
  const banks = await prisma.transportBank.findMany();

  // Get sum of bank loan amounts
  const banksTotalLoanAmount = await prisma.transportVehicleTransaction.aggregate({
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.BankLoan,
      deleted: null,
    },
    _sum: { amount: true },
  });

  // Get sum of bank loan amounts group by bank
  const bankLoanAmounts = await prisma.transportVehicleTransaction.groupBy({
    by: ['bankId'], // Group by bankId
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.BankLoan,
      deleted: null,
    },
    _sum: { amount: true },
  });
  const loans = bankLoanAmounts.map((entry) => ({
    bank: banks.find((bank) => bank.id === entry.bankId)?.bankName,
    totalAmount: entry._sum.amount,
  }));

  // Get sum of paid bank installments
  const banksTotalInstallmentsSum = await prisma.transportVehicleTransaction.aggregate({
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.BankInstallment,
      deleted: null,
    },
    _sum: { amount: true },
  });

  // Get sum of bank loan amounts group by bank
  const bankInstallments = await prisma.transportVehicleTransaction.groupBy({
    by: ['bankId'], // Group by bankId
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.BankInstallment,
      deleted: null,
    },
    _sum: { amount: true },
  });
  const installments = bankInstallments.map((entry) => ({
    bank: banks.find((bank) => bank.id === entry.bankId)?.bankName,
    totalAmount: entry._sum.amount,
  }));

  // Get sum of expenses
  const expenses = await prisma.transportVehicleTransaction.aggregate({
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.Expense,
      deleted: null,
    },
    _sum: { amount: true },
  });

  // Get sum of customer payments
  const customerPayments = await prisma.transportVehicleTransaction.aggregate({
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.CustomerPayment,
      deleted: null,
    },
    _sum: { amount: true },
  });

  const total =
    (banksTotalLoanAmount._sum.amount ?? 0) +
    (banksTotalInstallmentsSum._sum.amount ?? 0) +
    (expenses._sum.amount ?? 0) +
    (customerPayments._sum.amount ?? 0);

  return {
    transactions,
    totalCount,
    banksLoanSum: banksTotalLoanAmount._sum.amount ?? 0,
    banksInstallmentsSum: banksTotalInstallmentsSum._sum.amount ?? 0,
    loans,
    installments,
    expenses: expenses._sum.amount ?? 0,
    customerPayments: customerPayments._sum.amount ?? 0,
    balance: total,
  };
};
