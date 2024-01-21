import { Prisma, PrismaClient } from '@prisma/client';
import type { Customer } from '@prisma/client';
import { UCFirst } from '../../../lib/utils';

const prisma = new PrismaClient();

export const updateCustomer = async (customer: Customer): Promise<Customer | null> => {
  const updateData = JSON.parse(JSON.stringify(customer));
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  updateData.customerName = UCFirst(updateData.customerName);

  const result = await prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: updateData,
  });

  return result;
};
