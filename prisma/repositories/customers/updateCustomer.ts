import { PrismaClient } from '@prisma/client';
import type { Customer } from '@prisma/client';

const prisma = new PrismaClient();

export const updateCustomer = async (customer: Customer): Promise<Customer | null> => {
  const updateData = JSON.parse(JSON.stringify(customer));
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  updateData.customerName = updateData.customerName;

  const result = await prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: updateData,
  });

  return result;
};
