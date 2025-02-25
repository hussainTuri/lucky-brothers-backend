import prisma from '../../../../middleware/prisma';

export const getCustomer = async (id: number | string) => {
  const customer = await prisma.transportCustomer.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      reservations: {
        include: {
          customer: true,
          rentalCycles: {
            include: {
              rentalCyclePayments: true,
            },
          },
        },
        orderBy: [
          {
            reservationEnd: 'desc',
          },
          {
            reservationStart: 'desc',
          },
        ],
      },
    },
  });
  return customer;
};
