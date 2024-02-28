import { PrismaClient } from '@prisma/client';
import type { Customer, Invoice, InvoiceItem } from '@prisma/client';
import { InvoicePayload } from '../../../types';
import { updateProfit } from './';
import { CustomerTransactionTypesEnum, TransactionModeEnum } from '../../../lib/enums';
import { InvoiceStatusEnum } from '../../../lib/enums/invoice';
import { updateCustomerBalance } from '../customers/common';
import { removeFromStock } from '../products';

const prisma = new PrismaClient();

export const saveInvoice = async (payload: InvoicePayload): Promise<Invoice | null> => {
  const { invoice, items, customer, mode } = payload;

  return await saveInvoiceTransaction(invoice, items, customer, mode);
};

const saveInvoiceTransaction = async (
  invoice: Partial<Invoice>,
  items: Partial<InvoiceItem>[],
  customer?: Partial<Customer>,
  mode?: number,
): Promise<Invoice | null> => {
  return prisma.$transaction(async (tx) => {
    let createdCustomer = null;

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
        profit: 0,
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
          invoice.statusId === InvoiceStatusEnum.Paid
            ? {
                create: {
                  amount: invoice.totalAmount!,
                  comment: 'Immediate',
                  mode: mode ?? TransactionModeEnum.Cash,
                },
              }
            : undefined,
      },
      include: {
        items: {
          include: {
            productStocks: true,
          },
        },
        payments: true,
        customer: true,
      },
    });

    // 3. Remove items quantity from stock
    await removeFromStock(tx, createdInvoice.items);

    // 4. update profit
    await updateProfit(tx, createdInvoice.id);

    // 5. Add invoice as a transaction to the customerTransactions table
    if (createdInvoice.customer?.id) {
      await tx.customerTransaction.create({
        data: {
          customerId: invoice.customerId || createdInvoice.customer.id,
          typeId: CustomerTransactionTypesEnum.Invoice,
          invoiceId: createdInvoice.id,
          amount: createdInvoice.totalAmount * -1,
          comment: `Invoice`,
          mode: 0,
        },
      });

      // 6. Add payment as transaction to the customerTransactions table if it was paid
      if (invoice.statusId === InvoiceStatusEnum.Paid) {
        await tx.customerTransaction.create({
          data: {
            customerId: invoice.customerId || createdInvoice.customer.id,
            typeId: CustomerTransactionTypesEnum.Payment,
            invoiceId: createdInvoice.id,
            amount: createdInvoice.totalAmount,
            comment: `Invoice cash payment`,
            mode: mode ?? TransactionModeEnum.Cash,
          },
        });
      }

      // 7. Update customer balance
      await updateCustomerBalance(tx, createdInvoice.customer.id);
    }

    return createdInvoice;
  });
};
