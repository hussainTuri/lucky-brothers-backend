import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCustomers = async () => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        id: 'desc',
      },
      take: 50,
    });
    return customers;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
