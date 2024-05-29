import { PrismaClient } from '@prisma/client';
import type { Invoice } from '@prisma/client';
import { InvoiceWithRelations } from '../../../types';
import { addToStock } from '../products';
import { CustomerTransactionTypesEnum } from '../../../lib/enums';
import { InvoiceStatusEnum } from '../../../lib/enums/invoice';
import { updateCustomerBalance } from '../customers/common';

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

export const refundInvoice = async (id: number): Promise<Invoice | null> => {
  const dbInvoice = await prisma.invoice.findUnique({
    where: {
      id: id,
    },
    include: {
      items: true,
      payments: true,
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
    // 1. update invoice
    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        statusId: InvoiceStatusEnum.Refunded,
        refundedAt: new Date(),
      },
    });

    // 2. Add back stock quantity
    await addToStock(tx, invoice.items!);

    // 3. Deduct payments as refund
    if (invoice.customerId) {
      for (const payment of invoice.payments || []) {
        await tx.customerTransaction.create({
          data: {
            customerId: invoice.customerId,
            typeId: CustomerTransactionTypesEnum.Refund,
            amount: payment.amount * -1,
            comment: `Invoice #${invoice.id} payment refund`,
            mode: payment.mode,
          },
        });
      }
    }

    // 4. Reset refunded invoice transaction to 0
    // let's say you add a invoice of 5 dirham to account x, that is you debit account x with 5 dirham (-)
    // now let's say it was a cash payment, so the next transaction is payment of 5 dirham. so you credit account x with 5 dirham (+)
    // Now you refund the invoice, so you credit account x with 5 dirham (-)
    // so you see its debited twice and credited once. so the balance is not correct.
    // so we need to reset the invoice transaction to 0
    if (invoice.customerId) {
      const transactionId = await tx.customerTransaction.findFirst({
        where: {
          invoiceId: invoice.id,
          typeId: CustomerTransactionTypesEnum.Invoice,
        },
      });
      if (transactionId) {
        await tx.customerTransaction.update({
          where: {
            id: transactionId.id,
          },
          data: {
            amount: 0,
          },
        });
      }
    }

    // 5. update customer balance
    if (invoice.customerId) await updateCustomerBalance(tx, invoice.customerId);

    return updatedInvoice;
  });
};
