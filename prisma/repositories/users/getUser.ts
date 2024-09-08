import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

export const getUser = async (id: number | string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: Number(id),
    },
  });

  return exclude(user, ['password']);
};

const exclude = (user: User, keys: string[]) =>
  Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key)));
