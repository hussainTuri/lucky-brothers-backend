import { InvoiceItem, PrismaClient } from '@prisma/client';
import { DefaultArgs, PrismaClientOptions } from '@prisma/client/runtime/library';

/**
 * Pay attention to quantiySold. For adding items use positive number and for removing items use negative number.
 *
 * @param tx
 * @param productId
 * @param quantitySold
 * @param invoiceId
 * @param reason
 */
export const updateStockQuantity = async (
  tx: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  productId: number,
  quantitySold: number,
  invoiceId?: number,
  reason?: string,
): Promise<void> => {
  const dbProduct = await tx.product.findUnique({
    where: {
      id: productId,
    },
  });

  const dbInventory = await tx.inventory.findFirst({
    where: {
      productId,
    },
    orderBy: {
      id: 'desc',
    },
  });

  if (!dbProduct) {
    throw new Error('پروڈکٹ نہیں ملا');
  }

  let currentInventoryQuantity = 0;
  if (dbInventory) {
    currentInventoryQuantity = dbInventory.quantity;
  }

  const newInventoryQuantity = currentInventoryQuantity + quantitySold;

  // Add inventory
  await tx.inventory.create({
    data: {
      productId: dbProduct.id,
      quantity: newInventoryQuantity,
      reason: reason || `Invoice #${invoiceId}`,
    },
  });

  // Update product stock quantity
  await tx.product.update({
    where: {
      id: dbProduct.id,
    },
    data: {
      stockQuantity: newInventoryQuantity,
    },
  });
};

export const getProfit = async (
  tx: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  items: Partial<InvoiceItem>[],
): Promise<number> => {
  const products = await tx.product.findMany({
    where: {
      id: {
        in: items.map((item) => item.productId!),
      },
    },
  });
  const profit = items.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const costPrice = product.buyingPrice || 0;
      const profit = (item.price || 0) - costPrice;
      return acc + profit * (item.quantity || 0);
    }
    return acc;
  }, 0);

  return profit;
};
