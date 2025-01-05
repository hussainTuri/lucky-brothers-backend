import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      priceHistory: true,
      productStocks: true,
    },
  });
  return products;
};
