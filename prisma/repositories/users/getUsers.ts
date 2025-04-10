import type { User } from '@prisma/client';
import { getCache, setCache } from '../../../lib/utils';
import { CacheKeys } from '../../../lib/constants';
import prisma from '../../../middleware/prisma';

export const getUsers = async () => {
  const cachedUsers = getCache<User[]>(CacheKeys.USERS.key);
  if (cachedUsers) {
    return exclude(cachedUsers, ['password']);
  }

  const users = await prisma.user.findMany();

  // Cache data
  setCache(CacheKeys.USERS.key, users, CacheKeys.USERS.ttl);

  return exclude(users, ['password']);
};

const exclude = (users: User[], keys: string[]) =>
  users.map((user) =>
    Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key))),
  );
