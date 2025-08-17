import { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import prisma from '../../middleware/prisma';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { DateTime } from 'luxon';

export const getVatReport = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  try {
    const { startDate, endDate, from, to } = req.query as {
      startDate?: string;
      endDate?: string;
      from?: string;
      to?: string;
    };

    // Accept either startDate/endDate or from/to
    const startStr = startDate || from;
    const endStr = endDate || to;

    // Build an inclusive whole-day range: [startOfDay(start), startOfDay(end + 1 day))
    const start = startStr
      ? DateTime.fromISO(startStr).startOf('day').toJSDate()
      : new Date('1970-01-01');

    const endExclusive = endStr
      ? DateTime.fromISO(endStr).plus({ days: 1 }).startOf('day').toJSDate()
      : new Date(); // If no end provided, default to 'now'

    // Sales VAT from Invoice.vat
    const salesAgg = await prisma.invoice.aggregate({
      _sum: { vat: true },
      where: { createdAt: { gte: start, lt: endExclusive } },
    });

    // Purchase VAT from ProductStock.vat
    const purchaseAgg = await prisma.productStock.aggregate({
      _sum: { vat: true },
      where: { createdAt: { gte: start, lt: endExclusive } },
    });

    const salesVat = Number(salesAgg._sum.vat || 0);
    const purchaseVat = Number(purchaseAgg._sum.vat || 0);
    const dueVat = salesVat - purchaseVat;

    resp.data = { salesVat, purchaseVat, dueVat };
    return res.json(resp);
  } catch (error) {
    console.error('VAT report error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }
};
