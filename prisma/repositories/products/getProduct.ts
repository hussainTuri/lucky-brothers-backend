import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProduct = async (id: number | string) => {
  const product = await prisma.product.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      priceHistory: true,
      productType: true,
      inventories: {
        orderBy: {
          id: 'desc',
        },
      },
    },
  });
  return product;
};
