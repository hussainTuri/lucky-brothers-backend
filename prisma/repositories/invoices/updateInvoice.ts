import { Prisma, PrismaClient } from '@prisma/client';
import type { Customer, Invoice, InvoiceItem } from '@prisma/client';
import { getRelatedData } from './getRelatedData';
import { InvoicePayload } from '../../../types';

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

export const updateInvoice = async (payload: InvoicePayload): Promise<Invoice | null> => {
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

  // TODO: Update Stock quantity when you've added inventory tables

  const updatedInvoice = await updateInvoiceTransaction(
    invoice as Invoice,
    matchingItems,
    newItems,
    removedItems,
  );

  return updatedInvoice;
};

const updateInvoiceTransaction = async (
  invoice: Invoice,
  upateItems: InvoiceItem[],
  createItem: InvoiceItem[],
  removeItem: InvoiceItem[],
) => {
  return prisma.$transaction(async (tx) => {
    // 1. upate existing items
    await Promise.all(
      upateItems.map(async (item) => {
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
        return tx.invoiceItem.delete({
          where: {
            id: item.id,
          },
        });
      }),
    );

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

    return updatedInvoice;
  });
};
