import prisma from '../../../../middleware/prisma';

export const getCustomer = async (id: number | string) => {
  const customer = await prisma.transportCustomer.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      reservations: {
        where: {
          deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
        },
        include: {
          customer: true,
          rentalCycles: {
            where: {
              deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
            },
            include: {
              rentalCyclePayments: {
                where: {
                  deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
                },
              },
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
