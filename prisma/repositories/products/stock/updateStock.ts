import type { ProductStock } from '@prisma/client';
import { getRemainingStockQuantity } from '../';
import prisma from '../../../../middleware/prisma';

export const updateStock = async (entry: ProductStock): Promise<ProductStock | null> => {
  return await updateStockEntry(entry);
};

const updateStockEntry = async (entry: ProductStock): Promise<ProductStock | null> => {
  return prisma.$transaction(async (tx) => {
    // Use case: User adds 5 new batteries to stock. Per battery price is 100. User closes the day with the price amount (500) subtracted from cash in daily report.
    // Now a few days later, user realize that it was actually 4 batteries and updates the stock entry record. This created a discrepancy in the daily report for that day.
    // This means if total cash for that day was 1500, it should have been 1600. This is a bug.
    // The reverse is also true if user realizes it was instead 6 batteries ...
    // I don't yet kow how to fix this.

    // 1 save stock
    const stockEntryUpdated = await tx.productStock.update({
      where: {
        id: entry.id,
      },
      data: {
        originalQuantity: entry.originalQuantity,
        pricePerItem: entry.pricePerItem,
        remainingQuantity: entry.remainingQuantity,
        receiptNumber: entry.receiptNumber,
        updatedById: entry.updatedById,
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
        updatedById: entry.updatedById,
      },
    });

    return stockEntryUpdated;
  });
};
