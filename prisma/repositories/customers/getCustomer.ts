import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCustomer = async (id: number | string) => {
  try {
    const customer = await prisma.customer.findFirstOrThrow({
      where: {
        id: Number(id),
      },
      include: {
        invoices: true,
      },
    });
    return customer;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
