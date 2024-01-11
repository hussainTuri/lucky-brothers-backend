import { Prisma, PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

export const updateUser = async (user: User): Promise<User | null> => {
  try {
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

    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};
