import prisma from '../../../../../middleware/prisma';

export const getCustomerTransactionByCustomer = async (
  customerId: number,
  transactionId: number,
) => {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }
  const transaction = await prisma.transportCustomerTransaction.findUnique({
    where: {
      id: transactionId,
      customerId,
    },
    include: {
      reservationRentalCyclePayment: {
        where: {
          deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
        },
      },
      vehicleTransaction: {
        where: {
          deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
        },
      },
    },
  });

  return transaction;
};
