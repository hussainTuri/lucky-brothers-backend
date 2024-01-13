import { Prisma, PrismaClient } from '@prisma/client';
import { InvoiceRelatedData } from '../../../types/';

const prisma = new PrismaClient();

export const getRelatedData = async () => {
  try {
    const data = {} as InvoiceRelatedData;
    data.statuses = await prisma.invoiceStatus.findMany();
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
