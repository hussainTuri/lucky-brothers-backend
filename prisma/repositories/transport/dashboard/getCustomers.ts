import prisma from '../../../../middleware/prisma';
import { QueryOptions, QuerySort } from '../../../../types';

export interface TransportDashboardCustomerRow {
  id: number;
  customerName: string;
  totalActiveReservations: number;
  totalRent: number;
  paidAmount: number;
  dueAmount: number;
}

export interface TransportDashboardCustomersResponse {
  customers: TransportDashboardCustomerRow[];
  totalCount: number;
  totalRentAmount: number;
  totalPaidAmount: number;
  totalDueAmount: number;
}

export async function getTransportCustomersDashboard(
  options: QueryOptions,
  sort?: QuerySort,
): Promise<TransportDashboardCustomersResponse> {
  // Determine orderBy for DB if sorting by persisted column; dueAmount will be handled in-memory later
  const baseOrderBy = sort?.customerName
    ? { customerName: sort.customerName }
    : sort?.id
      ? { id: sort.id }
      : sort?.createdAt
        ? { createdAt: sort.createdAt }
        : { id: 'desc' as const };

  // Fetch customers page and total count with optional name filter
  const where = options?.customerName
    ? { customerName: { contains: options.customerName, mode: 'insensitive' as const } }
    : undefined;

  const isDueSort = !!sort?.dueAmount;
  const skip = options?.skip ?? 0;
  const take = options?.take ?? 50;

  let customers: { id: number; customerName: string }[] = [];
  let totalCount = 0;

  if (isDueSort) {
    // When sorting by computed dueAmount, fetch all matching customers, then sort and slice in-memory
    customers = await prisma.transportCustomer.findMany({
      where,
      select: { id: true, customerName: true },
    });
    totalCount = await prisma.transportCustomer.count({ where });
  } else {
    [customers, totalCount] = await Promise.all([
      prisma.transportCustomer.findMany({
        where,
        orderBy: baseOrderBy,
        skip,
        take,
        select: { id: true, customerName: true },
      }),
      prisma.transportCustomer.count({ where }),
    ]);
  }

  const customerIds = customers.map((c) => c.id);
  if (customerIds.length === 0) {
    return {
      customers: [],
      totalCount,
      totalRentAmount: 0,
      totalPaidAmount: 0,
      totalDueAmount: 0,
    };
  }

  // Active reservations per customer (reservationEnd is NULL or in future), excluding soft-deleted
  const activeReservations = await prisma.transportVehicleReservation.groupBy({
    by: ['customerId'],
    where: {
      customerId: { in: customerIds },
      deleted: null,
      OR: [{ reservationEnd: null }, { reservationEnd: { gt: new Date() } }],
    },
    _count: { _all: true },
  });
  const activeReservationsMap = new Map<number, number>(
    activeReservations.map((r) => [r.customerId, r._count._all]) as [number, number][],
  );

  // Rent sums per customer across rental cycles (excluding soft-deleted cycles)
  const rentGroup = await prisma.transportVehicleReservationRentalCycle.groupBy({
    by: ['customerId'],
    where: { customerId: { in: customerIds }, deleted: null },
    _sum: { amount: true },
  });
  const rentMap = new Map<number, number>(
    rentGroup.map((g) => [g.customerId, g._sum.amount ?? 0]) as [number, number][],
  );

  // Payment sums per customer across rental cycle payments (excluding soft-deleted payments)
  const payments = await prisma.transportVehicleReservationRentalCyclePayment.findMany({
    where: {
      deleted: null,
      vehicleReservationRentalCycle: { customerId: { in: customerIds }, deleted: null },
    },
    select: {
      amount: true,
      vehicleReservationRentalCycle: { select: { customerId: true } },
    },
  });
  const paidMap = new Map<number, number>();
  for (const p of payments) {
    const cid = p.vehicleReservationRentalCycle.customerId;
    paidMap.set(cid, (paidMap.get(cid) ?? 0) + (p.amount ?? 0));
  }

  // Grand totals across all customers
  const [rentTotalAgg, paidTotalAgg] = await Promise.all([
    prisma.transportVehicleReservationRentalCycle.aggregate({
      where: { deleted: null },
      _sum: { amount: true },
    }),
    prisma.transportVehicleReservationRentalCyclePayment.aggregate({
      where: { deleted: null },
      _sum: { amount: true },
    }),
  ]);
  const totalRentAmount = rentTotalAgg._sum.amount ?? 0;
  const totalPaidAmount = paidTotalAgg._sum.amount ?? 0;
  const totalDueAmount = totalRentAmount - totalPaidAmount;

  let rows = customers.map((c) => {
    const totalRent = rentMap.get(c.id) ?? 0;
    const paidAmount = paidMap.get(c.id) ?? 0;
    const dueAmount = totalRent - paidAmount;
    return {
      id: c.id,
      customerName: c.customerName,
      totalActiveReservations: activeReservationsMap.get(c.id) ?? 0,
      totalRent,
      paidAmount,
      dueAmount,
    } as TransportDashboardCustomerRow;
  });

  // If requested, sort by dueAmount in-memory (post aggregation)
  if (isDueSort) {
    const dir = sort!.dueAmount === 'asc' ? 1 : -1;
    rows.sort((a, b) => (a.dueAmount - b.dueAmount) * dir);
    // Apply paging on the sorted full set
    rows = rows.slice(skip, skip + take);
  }

  return {
    customers: rows,
    totalCount,
    totalRentAmount,
    totalPaidAmount,
    totalDueAmount,
  };
}
