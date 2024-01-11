import { PrismaClient, type User } from '@prisma/client';
import { extend } from 'joi';
const prisma = new PrismaClient();

export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        username,
      },
    });

    return user;
  } catch (e) {
    console.error(e);
    return null;
  }
};
