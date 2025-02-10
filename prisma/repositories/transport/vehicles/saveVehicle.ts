import { PrismaClient } from '@prisma/client';
import type { Cash } from '@prisma/client';

const prisma = new PrismaClient();

export const saveCash = async (entry: Cash): Promise<Cash | null> => {
  return await saveCashEntry(entry);
};

const saveCashEntry = async (entry: Cash): Promise<Cash | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save cash
    const entryCreated = await tx.cash.create({
      data: entry,
    });

    return entryCreated;
  });
};
