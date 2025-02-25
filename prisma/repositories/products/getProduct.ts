import prisma from "../prismaClient";

export const getProduct = async (id: number | string) => {
  const product = await prisma.product.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      priceHistory: true,
      productType: true,
      productStocks: {
        orderBy: {
          id: 'desc',
        },
      },
    },
  });
  return product;
};
