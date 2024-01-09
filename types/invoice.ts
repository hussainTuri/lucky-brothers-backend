import { Customer, Invoice, InvoiceItem, InvoiceStatus, Prisma } from '@prisma/client';

export interface InvoiceRelatedData {
  statuses: InvoiceStatus[];
}

export type QueryInvoiceStatus = 'pending' | 'paid' | 'overdue';
export interface QueryOptions {
  status?: QueryInvoiceStatus;
  today?: boolean;
  take?: number;
}

export type SortOrder = 'asc' | 'desc';
export interface QuerySort {
  id?: SortOrder;
  createdAt?: SortOrder;
}

export interface InvoicePayload {
  invoice: Partial<Invoice>;
  items: Partial<InvoiceItem>[];
  customer: Partial<Customer>;
}
