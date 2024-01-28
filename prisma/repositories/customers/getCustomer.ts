import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCustomer = async (id: number | string) => {
  const customer = await prisma.customer.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      invoices: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
        },
        orderBy: {
          id: 'desc',
        },
      },
      transactions: true,
    },
  });
  return customer;
};
