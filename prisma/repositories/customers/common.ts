import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs, PrismaClientOptions } from '@prisma/client/runtime/library';
import { InvoiceStatusEnum } from '../../../lib/enums';

export const updateCustomerBalance = async (
  tx: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  customerId: number,
) => {
  const result = await tx.customerTransaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      customerId: customerId,
      AND: [
        {
          OR: [
            { invoiceId: null },
            {
              invoice: {
                statusId: { notIn: [InvoiceStatusEnum.Cancelled, InvoiceStatusEnum.Refunded] },
              },
            },
          ],
        },
      ],
    },
  });

  await tx.customer.update({
    where: {
      id: customerId,
    },
    data: {
      balance: result._sum.amount,
    },
  });
};
