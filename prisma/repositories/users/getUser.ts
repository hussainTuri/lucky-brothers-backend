import { PrismaClient, type User } from '@prisma/client';
import { extend } from 'joi';
const prisma = new PrismaClient();

export const getUser = async (id: number | string) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: Number(id),
      },
    });

    return user;
    // return exclude(user, ['password']);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// const exclude = <User, Key extends keyof User>(
//   user: User,
//   keys: Key[]
// ): Omit<User, Key> =>
//   Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key as Key))) as Omit<User, Key>;

// Exclude keys from user
