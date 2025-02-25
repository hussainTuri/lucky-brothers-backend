import prisma from "../prismaClient";

export const getMinimalProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      sku: true,
      productName: true,
      productTypeId: true,
      stockQuantity: true,
      createdAt: true,
      createdById: true,
      sellingPrice: true,
    },
  });
  return products;
};
