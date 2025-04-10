import type { Customer } from '@prisma/client';
import prisma from '../../../middleware/prisma';

export const saveCustomer = async (customer: Customer): Promise<Customer | null> => {
  const result = await prisma.customer.create({
    data: customer,
  });
  return result;
};
