import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProducts = async () => {
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
      manufacturer: true,
      manufacturingYear: true,
      imagePath: true,
      createdAt: true,
      createdById: true,
      sellingPrice: true,

      priceHistory: true,
      productStocks: true,
    },
  });
  return products;
};
