import {
  Customer,
  Invoice,
  InvoiceItem,
  InvoicePayment,
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
  startDate?: Date | string;
  endDate?: Date | string;
}

export type SortOrder = 'asc' | 'desc';
export interface QuerySort {
  id?: SortOrder;
  createdAt?: SortOrder;
  expenseDate?: SortOrder;
  monthYear?: SortOrder;
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
  payments?: InvoicePayment[];
};
