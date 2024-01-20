import { PrismaClient } from '@prisma/client';
import type { Customer, Invoice } from '@prisma/client';
import { getRelatedData } from './getRelatedData';
import { InvoicePayload } from '../../../types';

const prisma = new PrismaClient();

export const saveInvoice = async (payload: InvoicePayload): Promise<Invoice | null> => {
  const { invoice, items, customer } = payload;
  let createdCustomer = null;

  const paidStatusId = (await getRelatedData()).statuses.find(
    (status) => status.statusName === 'Paid',
  )?.id;

  if (customer) {
    createdCustomer = await prisma.customer.create({
      data: customer as Customer,
    });
  }

  const createdInvoice = await prisma.invoice.create({
    data: {
      customerId: invoice?.customerId || createdCustomer?.id || null,
      totalAmount: invoice.totalAmount!,
      dueDate: invoice.dueDate || null,
      statusId: invoice.statusId!,
      comment: invoice.comment,
      driverName: invoice.driverName,
      vehicleName: invoice.vehicleName,
      vehicleRegistrationNumber: invoice.vehicleRegistrationNumber,
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

  // TODO: Update Stock quantity when you've added inventory tables

  return createdInvoice;
};
