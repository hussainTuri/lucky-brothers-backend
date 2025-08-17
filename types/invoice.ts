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
  date?: Date | string;
  vehicleRegistrationNumber: string;
  customerName?: string; // added for dashboard customer name filter
}

export type SortOrder = 'asc' | 'desc';
export interface QuerySort {
  id?: SortOrder;
  createdAt?: SortOrder;
  expenseDate?: SortOrder;
  monthYear?: SortOrder;
  cashDate?: SortOrder;
  reportDate?: SortOrder;
  customerName?: SortOrder; // existing addition
  dueAmount?: SortOrder; // added for dashboard due sorting
  // dashboard specific
  month?: SortOrder;
  vehicleName?: SortOrder;
  vehicleRegistration?: SortOrder;
  balance?: SortOrder; // added for vehicles balance sorting
}

export interface InvoicePayload {
  invoice: Partial<Invoice>;
  items: Partial<InvoiceItem>[];
  customer: Partial<Customer>;
  mode: number;
  createdById?: number;
  updatedById?: number;
}

export interface AccumulatedQuantity {
  productId: number;
  quantity: number;
}

export type InvoiceWithRelations = PrismaInvoice & {
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
};
