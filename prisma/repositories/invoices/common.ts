import { InvoicePayment, Prisma } from '@prisma/client';
import { getInvoice } from './getInvoice';
import { InvoiceIncludeOptions } from '../../../types/includeOptions';
import { InvoiceStatusEnum } from '../../../lib/enums/invoice';
import type { OmitPrismaClient } from '../../../types/';
import { CustomError } from '../../../lib/errorHandler';
import { messages } from '../../../lib/constants';

export const getProfit = async (tx: OmitPrismaClient, invoiceId: number): Promise<number> => {
  const invoice = await tx.invoice.findUniqueOrThrow({
    where: {
      id: invoiceId,
    },
    include: {
      items: {
        include: {
          product: true,
          productStocks: {
            include: {
              productStock: true,
            },
          },
        },
      },
    },
  });

  const profit = invoice.items.reduce((acc, item) => {
    if (!item.productStocks) {
      throw new CustomError(messages.PRODUCT_STOCK_NOT_FOUND, 'PRODUCT_STOCK_NOT_FOUND');
    }

    const profit = item.productStocks.reduce((ac, stock) => {
      const costPrice = Number(stock.productStock.pricePerItem) || 0;
      const prof = (Number(item.price) || 0) - costPrice;
      return ac + prof * (stock.quantity || 0);
    }, 0);

    return acc + profit;
  }, 0);

  return profit;
};

export const updateProfit = async (tx: OmitPrismaClient, invoiceId: number): Promise<void> => {
  const profit = await getProfit(tx, invoiceId);
  await tx.invoice.update({
    where: {
      id: invoiceId,
    },
    data: {
      profit,
    },
  });
};

export const saveInvoicePayment = async (
  tx: OmitPrismaClient,
  invoiceId: number,
  payment: InvoicePayment,
) => {
  let statusChangeNeeded = false;
  const includeOptions: InvoiceIncludeOptions = {
    payments: true,
  };
  const invoice = await getInvoice(invoiceId, includeOptions);

  if (
    invoice.totalAmount <=
    payment.amount + (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
  ) {
    statusChangeNeeded = true;
    invoice.statusId = InvoiceStatusEnum.Paid;
  }

  // 1 save payment
  const createdPayment = await tx.invoicePayment.create({
    data: payment,
  });

  // 2 update invoice status
  if (statusChangeNeeded) {
    await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        statusId: invoice.statusId,
        updatedById: payment.updatedById,
      },
    });
  }

  return createdPayment;
};

export const updateInvoiceStatus = async (
  tx: OmitPrismaClient,
  invoiceId: number,
) => {
  const invoice = await tx.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error('رسید نہیں ملی');
  }

  const paidAmount = invoice.payments?.reduce((sum, p) => sum + p.amount, 0);
  const status =
    invoice.totalAmount <= paidAmount ? InvoiceStatusEnum.Paid : InvoiceStatusEnum.Pending;

  await tx.invoice.update({
    where: {
      id: invoice.id,
    },
    data: {
      statusId: status,
    },
  });
};
