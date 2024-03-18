import { Prisma, PrismaClient } from '@prisma/client';
import { QueryOptions } from '../../../types';
import { CustomerTransactionTypesEnum, InvoiceStatusEnum } from '../../../lib/enums';

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
//   console.log('------------------------------------------------------\n')
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const getJournal = async (options: QueryOptions) => {
  const whereCreated = {
    AND: [
      ...(options?.startDate ? [{ createdAt: { gte: options.startDate } }] : []),
      ...(options?.endDate ? [{ createdAt: { lte: options.endDate } }] : []),
    ],
  };

  const [
    invoices,
    refundedInvoices,
    cancelledInvoices,
    stocksPurchase,
    customerPayments,
    cashes,
    cashesOut,
    expenses,
  ] = await Promise.all([
    getInvoices(whereCreated),
    getRefundedInvoices(options),
    getCancelledInvoices(options),
    getStocksPurchase(whereCreated),
    getCustomerPayments(whereCreated),
    getCashes(options),
    getCashesOut(options),
    getExpenses(options),
  ]);

  return {
    invoices,
    refundedInvoices,
    cancelledInvoices,
    stocksPurchase,
    customerPayments,
    cashes,
    cashesOut,
    expenses,
  };
};

const getCashesOut = async (options: QueryOptions) => {
  return await prisma.cashOut.findMany({
    where: {
      AND: [
        ...(options?.startDate ? [{ cashDate: { gte: options.startDate } }] : []),
        ...(options?.endDate ? [{ cashDate: { lte: options.endDate } }] : []),
      ],
    },
  });
};

const getCashes = async (options: QueryOptions) => {
  return await prisma.cash.findMany({
    where: {
      AND: [
        ...(options?.startDate ? [{ cashDate: { gte: options.startDate } }] : []),
        ...(options?.endDate ? [{ cashDate: { lte: options.endDate } }] : []),
      ],
    },
  });
};

const getExpenses = async (options: QueryOptions) => {
  return await prisma.expense.findMany({
    where: {
      AND: [
        ...(options?.startDate ? [{ expenseDate: { gte: options.startDate } }] : []),
        ...(options?.endDate ? [{ expenseDate: { lte: options.endDate } }] : []),
      ],
    },
  });
};

const getCustomerPayments = async (whereCreated: any) => {
  return await prisma.customerTransaction.findMany({
    where: {
      ...whereCreated,
      typeId: CustomerTransactionTypesEnum.Payment,
      invoiceId: null, // customer payments with invoice id means this payment was a result of an instantly paid invoice
    },
    include: {
      invoicePayments: true,
      customer: true,
    },
  });
};

const getStocksPurchase = async (whereCreated: any) => {
  return await prisma.productStock.findMany({
    where: {
      ...whereCreated,
    },
    include: {
      product: true,
    },
  });
};

const getInvoices = async (whereCreated: any) => {
  return await prisma.invoice.findMany({
    where: {
      ...whereCreated,
      statusId: {
        notIn: [InvoiceStatusEnum.Cancelled, InvoiceStatusEnum.Refunded],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
      payments: {
        where: {
          ...whereCreated,
          customerTransactionId: null, // customer payments are not of interest. they are handled in customer transactions above.
        },
      },
    },
  });
};

const getRefundedInvoices = async (options: QueryOptions) => {
  return await prisma.invoice.findMany({
    where: {
      AND: [
        ...(options?.startDate ? [{ refundedAt: { gte: options.startDate } }] : []),
        ...(options?.endDate ? [{ refundedAt: { lte: options.endDate } }] : []),
      ],
      statusId: InvoiceStatusEnum.Refunded,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
      payments: true,
    },
  });
};

const getCancelledInvoices = async (options: QueryOptions) => {
  return await prisma.invoice.findMany({
    where: {
      AND: [
        ...(options?.startDate ? [{ cancelledAt: { gte: options.startDate } }] : []),
        ...(options?.endDate ? [{ cancelledAt: { lte: options.endDate } }] : []),
      ],
      statusId: InvoiceStatusEnum.Cancelled,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
      payments: true,
    },
  });
};
