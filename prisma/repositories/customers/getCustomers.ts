import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCustomers = async () => {
  const customers = await prisma.customer.findMany({
    orderBy: {
      id: 'desc',
    },
    take: 50,
  });
  return customers;
};
