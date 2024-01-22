import { PrismaClient } from '@prisma/client';
import type { Customer, Invoice, InvoiceItem } from '@prisma/client';
import { getRelatedData } from './getRelatedData';
import { InvoicePayload } from '../../../types';
import { updateStockQuantity } from './common';

const prisma = new PrismaClient();

export const saveInvoice = async (payload: InvoicePayload): Promise<Invoice | null> => {
  const { invoice, items, customer } = payload;

  return await saveInvoiceTransaction(invoice, items, customer);
};

const saveInvoiceTransaction = async (
  invoice: Partial<Invoice>,
  items: Partial<InvoiceItem>[],
  customer?: Partial<Customer>,
): Promise<Invoice | null> => {
  return prisma.$transaction(async (tx) => {
    let createdCustomer = null;
    const paidStatusId = (await getRelatedData()).statuses.find(
      (status) => status.statusName === 'Paid',
    )?.id;

    // 1. Create Customer
    if (customer) {
      customer.customerName = customer.customerName!;
      createdCustomer = await tx.customer.create({
        data: customer as Customer,
      });
    }

    // 2. Create invoice
    const createdInvoice = await tx.invoice.create({
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

    // 3. Update Stock quantity
    await Promise.all(
      items.map(async (item) => {
        const reason = `Invoice #${createdInvoice.id} - Products Sold (Create Invoice) - Qty: ${
          item.quantity! * -1
        }`;
        await updateStockQuantity(
          tx,
          item.productId!,
          item.quantity! * -1,
          createdInvoice.id,
          reason,
        );
      }),
    );
    return createdInvoice;
  });
};
