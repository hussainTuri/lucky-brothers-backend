import { PrismaClient } from '@prisma/client';
import { InvoiceIncludeOptions, InvoiceItemIncludeOptions } from '../../../types/includeOptions';
const prisma = new PrismaClient();

export const getInvoice = async (id: number | string, includeOptions?: InvoiceIncludeOptions) => {
  const includeItems = includeOptions?.items
    ? {
        items: (includeOptions.items as InvoiceItemIncludeOptions)?.product
          ? { include: { product: true } }
          : true,
      }
    : {};
  const includeCustomer = includeOptions?.customer ? { customer: true } : {};
  const includePayments = includeOptions?.payments ? { payments: true } : {};

  const invoice = await prisma.invoice.findFirstOrThrow({
    where: {
      id: Number(id),
    },

    include: {
      ...includeItems,
      ...includeCustomer,
      ...includePayments,
    },
  });

  return invoice;
};
