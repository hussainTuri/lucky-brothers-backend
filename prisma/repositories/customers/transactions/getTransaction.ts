import prisma from '../../../../middleware/prisma';

export const getCustomerTransaction = async (id: number | string) => {
  const transaction = await prisma.customerTransaction.findFirstOrThrow({
    where: {
      id: Number(id),
    },
  });
  return transaction;
};
