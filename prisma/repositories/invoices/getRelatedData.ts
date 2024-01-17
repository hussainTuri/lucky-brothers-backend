import { Prisma, PrismaClient } from '@prisma/client';
import { InvoiceRelatedData } from '../../../types/';

const prisma = new PrismaClient();

export const getRelatedData = async () => {
  const data = {} as InvoiceRelatedData;
  data.statuses = await prisma.invoiceStatus.findMany();
  return data;
};
