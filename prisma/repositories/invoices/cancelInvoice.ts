import { PrismaClient } from '@prisma/client';
import type { Invoice, InvoiceItem } from '@prisma/client';
import { getRelatedData } from './getRelatedData';
import { updateStockQuantity } from './common';
import { InvoiceWithRelations } from '../../../types';

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

export const cancelInvoice = async (id: number): Promise<Invoice | null> => {
  const dbInvoice = await prisma.invoice.findUnique({
    where: {
      id: id,
    },
    include: {
      items: true,
    },
  });

  if (!dbInvoice) {
    throw new Error('رسید نہیں ملی');
  }

  const updatedInvoice = await updateInvoiceTransaction(dbInvoice);

  return updatedInvoice;
};

const updateInvoiceTransaction = async (invoice: InvoiceWithRelations) => {
  return prisma.$transaction(async (tx) => {
    const data = await getRelatedData();

    // 1. update invoice
    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        statusId: data.statuses.find((i) => i.statusName === 'Cancelled')?.id!,
        cancelledAt: new Date(),
      },
    });

    // 2. update stock quantity
    await Promise.all(
      invoice.items!.map(async (item) => {
        const reason = `Invoice #${invoice.id} - Products returned (cancelled) - Qty: ${item.quantity}`;
        await updateStockQuantity(tx, item.productId, item.quantity, invoice.id, reason);
      }),
    );

    return updatedInvoice;
  });
};
