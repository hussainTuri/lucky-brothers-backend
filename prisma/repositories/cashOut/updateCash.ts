import { CashOut, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateCashOut = async (entry: CashOut): Promise<CashOut | null> => {
  return await updateCashOutEntry(entry);
};

const updateCashOutEntry = async (entry: CashOut): Promise<CashOut | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 update cashOut
    const entryUpdated = await tx.cashOut.update({
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
