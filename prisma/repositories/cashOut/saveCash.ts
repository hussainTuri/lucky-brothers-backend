import { CashOut } from '@prisma/client';
import prisma from '../../../middleware/prisma';

export const saveCashOut = async (entry: CashOut): Promise<CashOut | null> => {
  return await saveCashOutEntry(entry);
};

const saveCashOutEntry = async (entry: CashOut): Promise<CashOut | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save cashOut
    const entryCreated = await tx.cashOut.create({
      data: entry,
    });

    return entryCreated;
  });
};
