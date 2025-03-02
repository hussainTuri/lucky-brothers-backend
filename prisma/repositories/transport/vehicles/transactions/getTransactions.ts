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

  // Get sum of bank loan amounts
  const bankLoanAmounts = await prisma.transportVehicleTransaction.aggregate({
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.BankLoan,
      deleted: null,
    },
    _sum: { amount: true },
  });

  // Get sum of paid bank installments
  const bankInstallments = await prisma.transportVehicleTransaction.aggregate({
    where: {
      vehicleId: vehicleId,
      transactionTypeId: TransportVehicleTransactionTypes.BankInstallment,
      deleted: null,
    },
    _sum: { amount: true },
  });

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
    (bankLoanAmounts._sum.amount ?? 0) +
    (bankInstallments._sum.amount ?? 0) +
    (expenses._sum.amount ?? 0) +
    (customerPayments._sum.amount ?? 0);

  return {
    transactions,
    totalCount,
    bankLoanAmounts: bankLoanAmounts._sum.amount ?? 0,
    bankInstallments: bankInstallments._sum.amount ?? 0,
    expenses: expenses._sum.amount ?? 0,
    customerPayments: customerPayments._sum.amount ?? 0,
    balance: total,
  };
};
