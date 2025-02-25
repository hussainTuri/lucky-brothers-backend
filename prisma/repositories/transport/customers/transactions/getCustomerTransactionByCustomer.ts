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
      reservationRentalCyclePayment: true,
      vehicleTransaction: true,
    }
  });

  return transaction;
};
