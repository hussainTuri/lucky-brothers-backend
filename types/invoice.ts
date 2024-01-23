import {
  Customer,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Invoice as PrismaInvoice,
} from '@prisma/client';

export interface InvoiceRelatedData {
  statuses: InvoiceStatus[];
}

export type QueryInvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export interface QueryOptions {
  status?: QueryInvoiceStatus;
  today?: boolean;
  skip?: number;
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

export interface AccumulatedQuantity {
  productId: number;
  quantity: number;
}

export type InvoiceWithRelations = PrismaInvoice & {
  items?: InvoiceItem[];
};
