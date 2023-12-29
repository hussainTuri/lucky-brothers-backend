import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProduct = async (id: number | string) => {
  try {
    const product = await prisma.product.findFirstOrThrow({
      where: {
        id: Number(id),
      },
      include: {
        priceHistory: true,
      },
    });
    return product;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
