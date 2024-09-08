import { PrismaClient, type User } from '@prisma/client';
const prisma = new PrismaClient();

export const getUsers = async () => {
  const users = await prisma.user.findMany();
  return exclude(users, ['password']);
};

const exclude = (users: User[], keys: string[]) =>
  users.map((user) =>
    Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key))),
  );
