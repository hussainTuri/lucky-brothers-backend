import { Prisma } from '@prisma/client';

export type OmitPrismaClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
