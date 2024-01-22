import { PrismaClient } from '@prisma/client';
import type { Customer } from '@prisma/client';

const prisma = new PrismaClient();

export const saveCustomer = async (customer: Customer): Promise<Customer | null> => {
  customer.customerName = customer.customerName;
  const result = await prisma.customer.create({
    data: customer,
  });
  return result;
};
