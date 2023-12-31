import { Prisma, PrismaClient } from '@prisma/client';
import type { Customer, Invoice } from '@prisma/client';
import { getRelatedData } from './getRelatedData';
import { InvoicePayload } from '../../../types';

const prisma = new PrismaClient();

export const saveInvoice = async (payload: InvoicePayload): Promise<Invoice | null> => {
  const { invoice, items, customer } = payload;
  let createdCustomer = null;
  console.log('saving', invoice);

  const paidStatusId = (await getRelatedData()).statuses.find(
    (status) => status.statusName === 'Paid',
  )?.id;

  try {
    if (customer) {
      createdCustomer = await prisma.customer.create({
        data: customer as Customer,
      });
    }
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new Error('اس فون کے ساتھ ایک گاہک پہلے سے موجود ہے۔');
      }
    }
    return null;
  }

  try {
    const createdInvoice = await prisma.invoice.create({
      data: {
        customerId: invoice?.customerId || createdCustomer?.id || null,
        totalAmount: invoice.totalAmount!,
        dueDate: invoice.dueDate || new Date(),
        statusId: invoice.statusId!,
        comment: invoice.comment,
        items: {
          createMany: {
            data: items.map((item) => ({
              productId: item.productId!,
              quantity: item.quantity!,
              price: item.price!,
              subTotal: item.subTotal!,
            })),
          },
        },
        payments:
          invoice.statusId === paidStatusId
            ? {
                create: {
                  amount: invoice.totalAmount!,
                  comment: 'Immediate',
                },
              }
            : undefined,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    console.log('createdInvoice', createdInvoice);
    return createdInvoice;
  } catch (e) {
    console.error('DB error', e);
    return null;
  }
};
