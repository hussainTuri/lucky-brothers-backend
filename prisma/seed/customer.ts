import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const customerData: Prisma.CustomerCreateInput[] = [
  {
    customerName: 'Sahar Hussain',
    email: 'sahar@beauty.com',
    phone: '03001234567',
    address: 'Gulshan-e-Iqbal, Karachi',
    imagePath: 'src/assets/no-image.jpg',

    invoices: {
      create: {
        totalAmount: 1000,
        dueDate: new Date(),
        statusId: 1,
        comment: 'This is a comment',
        items: {
          create: [
            {
              productId: 1,
              quantity: 1,
              subTotal: 200,
            },
          ],
        },
      },
    },
  },
];
