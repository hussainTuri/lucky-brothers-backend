import { PrismaClient } from '@prisma/client';
import type { ProductStock } from '@prisma/client';
import { getRemainingStockQuantity } from '../';

const prisma = new PrismaClient();

export const updateStock = async (entry: ProductStock): Promise<ProductStock | null> => {
  return await updateStockEntry(entry);
};

const updateStockEntry = async (entry: ProductStock): Promise<ProductStock | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save stock
    const stockEntryUpdated = await tx.productStock.update({
      where: {
        id: entry.id,
      },
      data: {
        originalQuantity: entry.originalQuantity,
        pricePerItem: entry.pricePerItem,
        remainingQuantity: entry.remainingQuantity,
      },
    });

    // 2 update Product stock quantity field
    const stockQuantity = await getRemainingStockQuantity(tx, entry.productId);

    await tx.product.update({
      where: {
        id: entry.productId,
      },
      data: {
        stockQuantity,
      },
    });

    return stockEntryUpdated;
  });
};
