import { InvoiceItemProductStock, Prisma, PrismaClient } from '@prisma/client';
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

export const getProductSales = async (
  productId: number | string,
  options: QueryOptions,
  sort?: QuerySort,
) => {
  let sortSql = 'iips.id DESC';
  if (sort?.id) {
    sortSql = `iips.id ${sort.id}`;
  }
  if (sort?.createdAt) {
    sortSql = `iips.createdAt ${sort.id}`;
  }

  let sql = `SELECT SQL_CALC_FOUND_ROWS DISTINCT iips.id
      FROM
          InvoiceItemProductStock iips
      JOIN
          InvoiceItem ii ON ( ii.id = iips.invoiceItemId AND ii.productId = ${productId})
      JOIN
          Invoice i ON i.id = ii.invoiceId
      WHERE
        i.statusId NOT IN (${InvoiceStatusEnum.Cancelled}, ${InvoiceStatusEnum.Refunded}) `;
  sql += ` ORDER BY ${sortSql}`;
  sql += ` LIMIT ${options?.take || 25} OFFSET ${options?.skip || 0};`;

  const productInvoiceItemIdsResult = await prisma.$queryRawUnsafe<InvoiceItemProductStock[]>(sql);
  let totalCountResult = await prisma.$queryRaw<{ totalFound: number }[]>(
    Prisma.sql`SELECT FOUND_ROWS() AS totalFound;`,
  );

  const totalCount =
    Array.isArray(totalCountResult) && totalCountResult.length ? totalCountResult[0].totalFound : 0;

  if (!Array.isArray(productInvoiceItemIdsResult) || productInvoiceItemIdsResult.length < 1) {
    return { productSales: [], totalCount: 0 };
  }

  let productInvoiceItemIds = productInvoiceItemIdsResult?.map((entry) => entry.id);

  const productSales = await prisma.invoiceItemProductStock.findMany({
    orderBy: {
      ...(sort?.id && { id: sort?.id || 'desc' }),
      ...(sort?.createdAt && { createdAt: sort?.createdAt }),
    },
    where: {
      id: {
        in: productInvoiceItemIds,
      },
    },
    include: {
      invoiceItem: true,
    },
  });

  return { productSales, totalCount: Number(totalCount) };
};
