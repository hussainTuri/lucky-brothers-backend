import type { User } from '@prisma/client';
import { clearCache } from '../../../lib/utils';
import { CacheKeys } from '../../../lib/constants';
import prisma from '../prismaClient';

export const saveUser = async (user: User): Promise<User | null> => {
  const result = await prisma.user.create({
    data: user,
  });

  // Clear cache on update
  clearCache(CacheKeys.USERS.key);

  return result;
};
