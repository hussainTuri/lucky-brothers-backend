import { Prisma, PrismaClient } from '@prisma/client';
import type { Customer } from '@prisma/client';

const prisma = new PrismaClient();

export const createCustomer = async (customer: Customer): Promise<Customer | null> => {
  try {
    const result = await prisma.customer.create({
      data: customer,
    });
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};
