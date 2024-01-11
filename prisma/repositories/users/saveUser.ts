import { Prisma, PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

export const saveUser = async (user: User): Promise<User | null> => {
  try {
    const result = await prisma.user.create({
      data: user,
    });
    return result;
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new Error('اسی صارف نام کا دوسرا صارف موجود ہے۔');
      }
    }
    return null;
  }
};
