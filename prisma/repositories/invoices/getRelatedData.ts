import { InvoiceRelatedData } from '../../../types/';
import { getCache, setCache } from '../../../lib/utils';
import { CacheKeys } from '../../../lib/constants';
import prisma from '../prismaClient';

export const getRelatedData = async () => {
  const cachedData = getCache<InvoiceRelatedData>(CacheKeys.INVOICE_RELATED_DATA.key);
  if (cachedData) {
    return cachedData;
  }
  const data = {} as InvoiceRelatedData;
  data.statuses = await prisma.invoiceStatus.findMany();

  // Cache data
  setCache(CacheKeys.INVOICE_RELATED_DATA.key, data, CacheKeys.INVOICE_RELATED_DATA.ttl);

  return data;
};
