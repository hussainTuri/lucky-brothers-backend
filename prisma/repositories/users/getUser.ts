import { PrismaClient, type User } from '@prisma/client';
const prisma = new PrismaClient();

export const getUser = async (id: number | string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: Number(id),
    },
  });

  // return exclude(user, ['password']);
  return user;
};

// const exclude = <User, Key extends keyof User>(
//   user: User,
//   keys: Key[]
// ): Omit<User, Key> =>
//   Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key as Key))) as Omit<User, Key>;

// Exclude keys from user
