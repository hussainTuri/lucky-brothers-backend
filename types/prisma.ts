import { PrismaClient } from '@prisma/client';
import { DefaultArgs, PrismaClientOptions } from '@prisma/client/runtime/library';

export type OmitPrismaClient = Omit<
  PrismaClient<PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
