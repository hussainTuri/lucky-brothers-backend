import { Prisma, PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';
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
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const getJournal = async (options: QueryOptions, sort: QuerySort) => {
  let where = '';
  let limit = '';
  if (options?.startDate) {
    where += ` AND createdAt >= '${(options?.startDate as Date).toISOString()}'`;
  }
  if (options?.endDate) {
    where += ` AND createdAt <= '${(options?.endDate as Date).toISOString()}'`;
  }

  let customerTransactionTableSql = `SELECT
    'ct' AS tableName,
    ct.id,
    ct.customerId,
    ct.invoiceId,
    ct.amount,
    ct.createdAt,
    inv.profit,
    inv.statusId
    FROM
    CustomerTransaction ct
        LEFT JOIN
    Invoice inv ON inv.id = ct.invoiceId AND inv.statusId NOT IN (${InvoiceStatusEnum.Cancelled} , ${InvoiceStatusEnum.Refunded})`;

  let invoiceTableSql = `SELECT
    'inv' AS tableName,
    id,
    customerId,
    id AS invoiceId,
    totalAmount * -1 as amount,
    createdAt,
    profit,
    statusId
    FROM
    Invoice
    WHERE
    customerId IS NULL AND statusId NOT IN (${InvoiceStatusEnum.Cancelled} , ${InvoiceStatusEnum.Refunded})`;

  let invoicePaymentTableSql = `SELECT
    'invp' AS tableName,
    invp.id,
    NULL AS customerId,
    invp.invoiceId,
    invp.amount,
    invp.createdAt,
    NULL AS profit,
    NULL AS statusId
    FROM
    InvoicePayment invp
        INNER JOIN
    Invoice inv ON invp.invoiceId = inv.id
    WHERE
    inv.customerId IS NULL
        AND inv.statusId NOT IN (${InvoiceStatusEnum.Cancelled} , ${InvoiceStatusEnum.Refunded})`;

  options.skip = options.skip ? Number(options.skip) : 0;
  options.take = options.take ? Number(options.take) : 50;
  limit = ` LIMIT ${options.skip}, ${options.take}`;

  let transactionsAndInvoices = (await prisma.$queryRawUnsafe(
    `SELECT TransactionsAndInvoices.*, COUNT(*) OVER () as rowsCount FROM (${customerTransactionTableSql} UNION ${invoiceTableSql} UNION ${invoicePaymentTableSql}) TransactionsAndInvoices WHERE 1=1 ${where} ORDER BY createdAt DESC ${limit} `,
  )) as any;

  const sumBalance = await prisma.$queryRawUnsafe(
    `SELECT SUM(amount) balance FROM( SELECT TransactionsAndInvoices.* FROM (${customerTransactionTableSql} UNION ${invoiceTableSql} UNION ${invoicePaymentTableSql}) TransactionsAndInvoices WHERE 1=1 ${where} ORDER BY createdAt DESC LIMIT 18446744073709551615 OFFSET ${
      options.skip + options.take
    }) tr`,
  );

  let minInvoiceId = 0;
  if (Array.isArray(transactionsAndInvoices) && transactionsAndInvoices.length > 0) {
    const invoiceIds = transactionsAndInvoices
      .filter((item: any) => item.invoiceId && item.tableName !== 'invp')
      .map((item: any) => item.invoiceId);
    minInvoiceId = invoiceIds.length ? Math.min(...invoiceIds) : 0;
  }

  const sumProfit = await prisma.$queryRawUnsafe(
    `SELECT SUM(inv.profit) profit FROM (SELECT profit FROM Invoice WHERE statusId NOT IN (${InvoiceStatusEnum.Cancelled} , ${InvoiceStatusEnum.Refunded}) ${where} AND id < ${minInvoiceId} ORDER BY createdAt DESC) inv`,
  );

  transactionsAndInvoices = (transactionsAndInvoices as any).map((item: any) => {
    item.amount = +item.amount.toString();
    return item;
  });

  let transactionsAndInvoicesCount = 0;
  transactionsAndInvoices = (transactionsAndInvoices as any).map((item: any) => {
    transactionsAndInvoicesCount = +item.rowsCount.toString();
    const { rowsCount, ...rest } = item;
    return rest;
  });

  const balance = (sumBalance as any).length ? +(sumBalance as any)[0].balance : 0;
  const profit = (sumProfit as any).length ? +(sumProfit as any)[0].profit : 0;
  return {
    journalEntries: transactionsAndInvoices,
    totalCount: transactionsAndInvoicesCount,
    balance,
    profit,
  };
};
