import prisma from '../prismaClient';

export const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      username,
    },
  });

  return user;
};
