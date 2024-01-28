import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCustomerTransaction = async (id: number | string) => {
  const transaction = await prisma.customerTransaction.findFirstOrThrow({
    where: {
      id: Number(id),
    },
  });
  return transaction;
};
