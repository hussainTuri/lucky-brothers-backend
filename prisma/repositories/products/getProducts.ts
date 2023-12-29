import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        priceHistory: true,
      },
    });
    return products;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
