import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomerTransactionByCustomer = async (customerId: number, transactionId: number) => {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }
  const transaction = await prisma.transportCustomerTransaction.findUnique({
    where: {
      id: transactionId,
      customerId,
    },
  });

  return transaction;
};
