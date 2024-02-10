import { PrismaClient } from '@prisma/client';
import type { ProductStock } from '@prisma/client';
import { getRemainingStockQuantity } from '../';

const prisma = new PrismaClient();

export const saveStock = async (entry: ProductStock): Promise<ProductStock | null> => {
  if (!entry.remainingQuantity) entry.remainingQuantity = entry.originalQuantity;
  return await saveStockEntry(entry);
};

const saveStockEntry = async (entry: ProductStock): Promise<ProductStock | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save stock
    const stockEntryCreated = await tx.productStock.create({
      data: entry,
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

    return stockEntryCreated;
  });
};
