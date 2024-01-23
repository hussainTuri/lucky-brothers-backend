import { PrismaClient } from '@prisma/client';
import type { Invoice as PrismaInvoice, InvoiceItem } from '@prisma/client';
import { AccumulatedQuantity, InvoicePayload, InvoiceWithRelations } from '../../../types';
import { getProfit, updateStockQuantity } from './common';
import { getRelatedData } from './getRelatedData';
import { th } from '@faker-js/faker';

const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//   ],
// });
// prisma.$on('query', async (e: Prisma.QueryEvent) => {
//   console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const updateInvoice = async (payload: InvoicePayload): Promise<PrismaInvoice | null> => {
  const { invoice, items } = payload;
  const dbInvoice = await prisma.invoice.findUnique({
    where: {
      id: invoice.id,
    },
    include: {
      items: true,
    },
  });

  if (!dbInvoice) {
    throw new Error('رسید نہیں ملی');
  }

  // Find matching and new and removed items between db and payload
  const matchingItems = items.filter((item) =>
    dbInvoice.items.find((i) => i.id === item.id),
  ) as InvoiceItem[];

  const newItems = items.filter(
    (item) => !dbInvoice.items.find((i) => i.id === item.id),
  ) as InvoiceItem[];

  const removedItems = dbInvoice.items.filter(
    (item) => !items.find((i) => i.id === item.id),
  ) as InvoiceItem[];

  const updatedInvoice = await updateInvoiceTransaction(
    invoice as PrismaInvoice,
    matchingItems,
    newItems,
    removedItems,
    dbInvoice,
  );

  // Update profit
  const i = await prisma.invoice.findUnique({
    where: {
      id: updatedInvoice.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  const profit = await getProfit(prisma, i?.items as InvoiceItem[]);
  await prisma.invoice.update({
    where: {
      id: updatedInvoice.id,
    },
    data: {
      profit,
    },
  });

  return updatedInvoice;
};

const updateInvoiceTransaction = async (
  invoice: PrismaInvoice,
  updateItems: InvoiceItem[],
  createItem: InvoiceItem[],
  removeItem: InvoiceItem[],
  invoiceBeforeUpdate: InvoiceWithRelations,
) => {
  return prisma.$transaction(async (tx) => {
    let stockQuantityPendingUpdate = [] as AccumulatedQuantity[];
    // 1. update existing items
    await Promise.all(
      updateItems.map(async (item) => {
        const qtyBeforeUpdate =
          invoiceBeforeUpdate.items?.find((i: InvoiceItem) => i.id === item.id)?.quantity || 0;
        if (qtyBeforeUpdate !== item.quantity) {
          stockQuantityPendingUpdate.push({
            productId: item.productId,
            quantity: qtyBeforeUpdate - item.quantity,
          });
        }
        return tx.invoiceItem.update({
          where: {
            id: item.id,
          },
          data: {
            quantity: item.quantity,
            price: item.price,
            subTotal: item.subTotal,
          },
        });
      }),
    );

    // 2. create new items
    await Promise.all(
      createItem.map(async (item) => {
        stockQuantityPendingUpdate.push({
          productId: item.productId,
          quantity: -item.quantity,
        });

        return tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity ?? 0,
            price: item.price ?? 0,
            subTotal: item.subTotal ?? 0,
          },
        });
      }),
    );

    // 3. remove items
    await Promise.all(
      removeItem.map(async (item) => {
        stockQuantityPendingUpdate.push({
          productId: item.productId,
          quantity: item.quantity,
        });

        return tx.invoiceItem.delete({
          where: {
            id: item.id,
          },
        });
      }),
    );

    // if totalAmount is changed, update invoice status to pending
    const pendingStatusId = (await getRelatedData()).statuses.find(
      (status) => status.statusName === 'Pending',
    )?.id;
    if (invoiceBeforeUpdate.totalAmount < invoice.totalAmount) {
      invoice.statusId = pendingStatusId || 0;
    }

    // 4. update invoice
    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        statusId: invoice.statusId,
        comment: invoice.comment,
        driverName: invoice.driverName,
        vehicleName: invoice.vehicleName,
        vehicleRegistrationNumber: invoice.vehicleRegistrationNumber,
      },
    });

    // 5. update stock quantity
    const accumulatedQuantities = accumulateQuantities(stockQuantityPendingUpdate);
    await Promise.all(
      accumulatedQuantities.map(async (item) => {
        const reason = `Invoice #${
          invoice.id
        } - Products Sold (Update Invoice)  - Qty: ${item.quantity!}`;
        await updateStockQuantity(tx, item.productId!, item.quantity!, invoice.id, reason);
      }),
    );

    return updatedInvoice;
  });
};

const accumulateQuantities = (stockPendingUpdates: AccumulatedQuantity[]) => {
  const accumulatedQuantities = [] as AccumulatedQuantity[];

  for (const pendingUpdate of stockPendingUpdates) {
    const { productId, quantity } = pendingUpdate;

    const existingEntry = accumulatedQuantities.find((entry) => entry.productId === productId);

    if (existingEntry) {
      existingEntry.quantity += quantity;
    } else {
      accumulatedQuantities.push({ productId, quantity });
    }
  }

  return accumulatedQuantities;
};
