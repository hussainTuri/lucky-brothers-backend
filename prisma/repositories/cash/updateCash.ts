import { Cash } from '@prisma/client';
import prisma from '../../../middleware/prisma';

export const updateCash = async (entry: Cash): Promise<Cash | null> => {
  return await updateCashEntry(entry);
};

const updateCashEntry = async (entry: Cash): Promise<Cash | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 update cash
    const entryUpdated = await tx.cash.update({
      where: {
        id: entry.id,
      },
      data: {
        amount: entry.amount,
        description: entry.description,
        cashDate: entry.cashDate,
        mode: entry.mode,
      },
    });

    return entryUpdated;
  });
};
