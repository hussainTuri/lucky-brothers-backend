import { Prisma, PrismaClient } from '@prisma/client';
import type { Customer } from '@prisma/client';
import { UCFirst } from '../../../lib/utils';

const prisma = new PrismaClient();

export const saveCustomer = async (customer: Customer): Promise<Customer | null> => {
  customer.customerName = UCFirst(customer.customerName);
  const result = await prisma.customer.create({
    data: customer,
  });
  return result;
};
