import { QuerySort, QueryOptions } from '../../../../../types';
import prisma from '../../../../../middleware/prisma';
import { TransportCustomerTransactionTypes } from '../../../../../lib/enums/transportCustomer';

export const getTransportCustomerTransactions = async (
  customerId: number,
  options: QueryOptions,
  sort: QuerySort,
) => {
  if (!customerId) {
    throw new Error('Customer ID is required');
  }
  const [transactions, totalCount] = await Promise.all([
    prisma.transportCustomerTransaction.findMany({
      include: {
        rentalCycle: {
          where: {
            deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
          },
        },
        reservationRentalCyclePayment: {
          where: {
            deleted: null,
          },
          include: {
            vehicleReservationRentalCycle: true,
          }
        },
        vehicle: true,
      },
      where: {
        customerId,
      },
      orderBy: {
        ...(sort.id && { id: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportCustomerTransaction.count({
      where: {
        customerId,
      },
    }),
  ]);

  // get customer payments sum
  const paymentSum = await prisma.transportCustomerTransaction.aggregate({
    where: {
      customerId: customerId,
      customerTransactionTypeId: TransportCustomerTransactionTypes.Payment,
      deleted: null,
    },
    _sum: { amount: true },
  });

  // get customer rent sum
  const rentSum = await prisma.transportCustomerTransaction.aggregate({
    where: {
      customerId: customerId,
      customerTransactionTypeId: TransportCustomerTransactionTypes.Rent,
      deleted: null,
    },
    _sum: { amount: true },
  });

  // customer transactions balance
  const balance = (rentSum._sum.amount ?? 0) + (paymentSum._sum.amount ?? 0);

  return {
    transactions,
    totalCount,
    paymentSum: paymentSum._sum.amount ?? 0,
    rentSum: rentSum._sum.amount ?? 0,
    balance,
  };
};
