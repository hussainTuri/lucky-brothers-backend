import prisma from '../../../middleware/prisma';

export const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      username,
    },
  });

  return user;
};
