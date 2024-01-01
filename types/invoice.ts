import { InvoiceStatus } from '@prisma/client';

export interface InvoiceRelatedData {
  statuses: InvoiceStatus[];
}
