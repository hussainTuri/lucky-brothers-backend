import { InvoiceItem, ProductStock, InvoiceItemProductStock } from '@prisma/client';
import type { OmitPrismaClient } from '../../../types/';
import { CustomError } from '../../../lib/errorHandler';
import { messages } from '../../../lib/constants';

export const getRemainingStockQuantity = async (
  tx: OmitPrismaClient,
  productId: number,
): Promise<number> => {
  const stockQuantity = await tx.productStock.aggregate({
    where: {
      productId: productId,
    },
    _sum: {
      remainingQuantity: true,
    },
  });

  return stockQuantity._sum.remainingQuantity || 0;
};

/**
 * Remove stock from inventory when products are sold
 *
 * 1. Save a record in InvoiceItemProductStock table to keep track of stock used for each invoice item
 * 2. Update stock quantity (remaining) in ProductStock table
 * 3. Update stock quantity in Product table
 *
 * @param tx OmitPrismaClient
 * @param items Partial<InvoiceItem>[]
 */
export const removeFromStock = async (
  tx: OmitPrismaClient,
  items: Partial<InvoiceItem>[],
): Promise<void> => {
  const productIds = (items.map((item) => item.productId) || []) as number[];

  const stockEntries = await tx.productStock.findMany({
    where: {
      productId: {
        in: productIds,
      },
      remainingQuantity: { gt: 0 },
    },
  });

  // Save InvoiceItem with productStockId in InvoiceItemProductStock table looping through remaining stock entries
  for (const item of items) {
    const productStocks = stockEntries.filter((entry) => item.productId === entry.productId);
    if (productStocks.length < 1) {
      throw new CustomError(messages.INSUFFICIENT_STOCK, 'INSUFFICIENT_STOCK');
    }

    const invoiceStockProductItemEntries = [] as InvoiceItemProductStock[];
    let purchasedQty = item.quantity || 0;
    for (const stock of productStocks) {
      const invoiceStockProductItemEntry = {} as InvoiceItemProductStock;

      if (purchasedQty <= 0) break;

      if (stock.remainingQuantity >= purchasedQty) {
        invoiceStockProductItemEntry.invoiceItemId = item.id!;
        invoiceStockProductItemEntry.productStockId = stock.id;
        invoiceStockProductItemEntry.quantity = purchasedQty;
        stock.remainingQuantity -= purchasedQty;
        stock.comment = `Invoice #${item.invoiceId} - create`;
        purchasedQty = 0;
        invoiceStockProductItemEntries.push(invoiceStockProductItemEntry);
        break;
      } else {
        invoiceStockProductItemEntry.invoiceItemId = item.id!;
        invoiceStockProductItemEntry.productStockId = stock.id;
        invoiceStockProductItemEntry.quantity = stock.remainingQuantity;
        purchasedQty -= stock.remainingQuantity;
        stock.remainingQuantity = 0;
        stock.comment = `Invoice #${item.invoiceId} - create`;
        invoiceStockProductItemEntries.push(invoiceStockProductItemEntry);
      }
    }

    // Throw error there weren't enough stock for the product
    if (purchasedQty > 0) {
      console.error('The current stock entries did not have sufficient quantity for the product');
      throw new CustomError(messages.INSUFFICIENT_STOCK, 'INSUFFICIENT_STOCK');
    }

    // Save InvoiceItemProductStock entries
    await tx.invoiceItemProductStock.createMany({
      data: invoiceStockProductItemEntries,
    });

    // Update stock entries for item
    for (const stock of productStocks) {
      await tx.productStock.update({
        where: {
          id: stock.id,
        },
        data: {
          remainingQuantity: stock.remainingQuantity,
          comment: stock.comment,
        },
      });
      const stockQuantity = await getRemainingStockQuantity(tx, stock.productId);
      await tx.product.update({
        where: {
          id: stock.productId,
        },
        data: {
          stockQuantity,
        },
      });
    }
  }
};

/**
 * Can be used by cancel, update or refund invoice when you want to add stock back to inventory
 * 1. delete records from InvoiceItemProductStock table
 * 2. update stock quantity (remaining) in ProductStock table
 * 3. update stock quantity in Product table
 *
 * @param tx OmitPrismaClient
 * @param items Partial<InvoiceItem>[]
 */
export const addToStock = async (
  tx: OmitPrismaClient,
  items: Partial<InvoiceItem>[],
): Promise<void> => {
  for (const item of items) {
    const invoiceItemProductStock = await tx.invoiceItemProductStock.findMany({
      where: {
        invoiceItemId: item.id,
      },
    });

    const productStockIds = invoiceItemProductStock.map(
      (entry) => entry.productStockId,
    ) as number[];

    const stockEntries = await tx.productStock.findMany({
      where: {
        id: {
          in: productStockIds,
        },
      },
    });

    // Delete records from InvoiceItemProductStock table
    await tx.invoiceItemProductStock.deleteMany({
      where: {
        invoiceItemId: item.id,
      },
    });

    // Update stock quantity (remaining) in ProductStock table
    for (const stock of stockEntries) {
      const invoiceItemProductStockEntry = invoiceItemProductStock.find(
        (entry) => entry.productStockId === stock.id,
      );
      if (!invoiceItemProductStockEntry) {
        console.error(
          'InvoiceItemProductStock entry not found',
          stockEntries,
          invoiceItemProductStock,
        );
        throw new CustomError(messages.PRODUCT_STOCK_NOT_FOUND, 'PRODUCT_STOCK_NOT_FOUND');
      }
      stock.remainingQuantity += invoiceItemProductStockEntry.quantity;
      stock.comment = `Invoice #${item.invoiceId} - update|refund|cancel`;
      await tx.productStock.update({
        where: {
          id: stock.id,
        },
        data: {
          remainingQuantity: stock.remainingQuantity,
          comment: stock.comment,
        },
      });
      const stockQuantity = await getRemainingStockQuantity(tx, stock.productId);
      await tx.product.update({
        where: {
          id: stock.productId,
        },
        data: {
          stockQuantity,
        },
      });
    }
  }
};
