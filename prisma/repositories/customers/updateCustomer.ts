import type { Customer } from '@prisma/client';
import prisma from '../prismaClient';

export const updateCustomer = async (customer: Customer): Promise<Customer | null> => {
  const updateData = JSON.parse(JSON.stringify(customer));
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const result = await prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: updateData,
  });

  return result;
};
