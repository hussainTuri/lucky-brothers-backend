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
  let where = 'WHERE 1=1';
  let limit = '';
  if (options?.startDate) {
    const s = new Date(options.startDate as string);
    s.setHours(0, 0, 0, 0);
    where += ` AND createdAt >= '${s.toISOString()}'`;
  }
  if (options?.endDate) {
    const s = new Date(options.endDate as string);
    s.setHours(23, 59, 59, 999);
    where += ` AND createdAt <= '${s.toISOString()}'`;
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
    NULL AS invoiceId,
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

  let transactionsAndInvoices = await prisma.$queryRawUnsafe(
    `SELECT TransactionsAndInvoices.*, COUNT(*) OVER () as rowsCount FROM (${customerTransactionTableSql} UNION ${invoiceTableSql} UNION ${invoicePaymentTableSql}) TransactionsAndInvoices ${where} ORDER BY createdAt DESC ${limit} `,
  );
  //   const transactionsAndInvoicesCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as recordsCount ${sql} ${where} ` );
  const sumBalance = await prisma.$queryRawUnsafe(
    `SELECT SUM(amount) balance FROM( SELECT TransactionsAndInvoices.* FROM (${customerTransactionTableSql} UNION ${invoiceTableSql} UNION ${invoicePaymentTableSql}) TransactionsAndInvoices ${where} ORDER BY createdAt DESC LIMIT 18446744073709551615 OFFSET ${
      options.skip + options.take
    }) tr`,
  );

  const sumProfit = await prisma.$queryRawUnsafe(
    `SELECT SUM(profit) profit FROM Invoice WHERE statusId NOT IN (${
      InvoiceStatusEnum.Cancelled
    } , ${InvoiceStatusEnum.Refunded}) ORDER BY createdAt DESC LIMIT 18446744073709551615 OFFSET ${
      options.skip + options.take
    }`,
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
