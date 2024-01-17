import { Prisma, PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

export const saveUser = async (user: User): Promise<User | null> => {
  const result = await prisma.user.create({
    data: user,
  });
  return result;
};
