import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      priceHistory: true,
    },
  });
  return products;
};
