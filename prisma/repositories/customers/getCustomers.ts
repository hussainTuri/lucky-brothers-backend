import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCustomers = async () => {
  try {
    const customers = await prisma.customer.findMany({
      take: 100,
    });
    return customers;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
