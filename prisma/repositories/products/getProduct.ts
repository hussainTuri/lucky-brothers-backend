import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProduct = async (id: number) => {
  try {
    const product = await prisma.product.findMany();
    return product;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
