import { Customer, CustomerTransaction, Invoice } from '@prisma/client';
import type { InvoiceWithRelations } from './';

export type CustomerWithRelations = Customer & {
  invoices?: InvoiceWithRelations[];
  transactions?: CustomerTransaction[];
};
