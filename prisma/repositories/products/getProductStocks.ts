import { Prisma, PrismaClient, ProductStock } from '@prisma/client';
import { QuerySort, QueryOptions } from '../../../types';
import { InvoiceStatusEnum } from '../../../lib/enums';
const prisma = new PrismaClient();

// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//   ],
// });
// prisma.$on('query', async (e: Prisma.QueryEvent) => {
//   console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
//   console.log('------------------------------------------------------\n');
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const getProductStocks = async (
  productId: number | string,
  options: QueryOptions,
  sort?: QuerySort,
) => {
  const productStockIdsResult = await prisma.$queryRaw<ProductStock[]>(
    Prisma.sql`SELECT SQL_CALC_FOUND_ROWS DISTINCT ps.id
      FROM
          ProductStock ps
      JOIN
          InvoiceItemProductStock iips ON ps.id = iips.productStockId
      JOIN
          InvoiceItem ii ON ii.id = iips.invoiceItemId
      JOIN
          Invoice i ON i.id = ii.invoiceId
      WHERE
          ps.productId = ${productId}
          AND i.statusId NOT IN (${InvoiceStatusEnum.Cancelled}, ${InvoiceStatusEnum.Refunded})
      ORDER BY
          ps.id ASC
      LIMIT ${options?.take || 0} OFFSET ${options?.skip || 0};`,
  );
  let totalCountResult = await prisma.$queryRaw<{ totalFound: number }[]>(
    Prisma.sql`SELECT FOUND_ROWS() AS totalFound;`,
  );

  const totalCount =
    Array.isArray(totalCountResult) && totalCountResult.length ? totalCountResult[0].totalFound : 0;

  if (!Array.isArray(productStockIdsResult) || productStockIdsResult.length < 1) {
    return [];
  }

  let productStockIds = productStockIdsResult?.map((entry) => entry.id);

  const productStocks = await prisma.productStock.findMany({
    orderBy: {
      ...(sort?.id && { id: sort?.id || 'desc' }),
      ...(sort?.createdAt && { createdAt: sort?.createdAt }),
    },
    where: {
      id: {
        in: productStockIds,
      },
    },
    include: {
      invoiceItemProductStocks: {
        include: {
          invoiceItem: true,
        },
      },
    },
  });

  return { productStocks, totalCount: Number(totalCount) };
};
