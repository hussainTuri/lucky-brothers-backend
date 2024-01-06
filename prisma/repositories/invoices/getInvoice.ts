import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getInvoice = async (id: number | string) => {
  try {
    const invoice = await prisma.invoice.findFirstOrThrow({
      where: {
        id: Number(id),
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },

        customer: true,
      },
    });
    return invoice;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
