import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProducts = async () => {
  try {
    const products = await prisma.product.findMany();
    return products;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
