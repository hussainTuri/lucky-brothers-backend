import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import { clearCache } from '../../../lib/utils';
import { CacheKeys } from '../../../lib/constants';

const prisma = new PrismaClient();

export const updateUser = async (user: User): Promise<User | null> => {
  const updateData = JSON.parse(JSON.stringify(user));
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: updateData,
  });

  delete (result as { password?: string }).password;

  // Clear cache on update
  clearCache(CacheKeys.USERS.key);

  return result;
};
