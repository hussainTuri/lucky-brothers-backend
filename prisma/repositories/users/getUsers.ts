import { PrismaClient, type User } from '@prisma/client';
import { getCache, setCache, Timer } from '../../../lib/utils';
import { CacheKeys } from '../../../lib/constants';
const prisma = new PrismaClient();

export const getUsers = async () => {
  const timer = new Timer('getUsers - repository');

  const cachedUsers = getCache<User[]>(CacheKeys.USERS.key);
  if (cachedUsers) {
    console.log('Returning cached users');
    timer.stop();
    return exclude(cachedUsers, ['password']);
  }

  const users = await prisma.user.findMany();

  // Cache data
  setCache(CacheKeys.USERS.key, users, CacheKeys.USERS.ttl);

  timer.stop();

  return exclude(users, ['password']);
};

const exclude = (users: User[], keys: string[]) =>
  users.map((user) =>
    Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key))),
  );
