import { PrismaClient, type User } from '@prisma/client';
import { extend } from 'joi';
const prisma = new PrismaClient();

export const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      username,
    },
  });

  return user;
};
