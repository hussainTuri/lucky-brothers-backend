import { TransportVehicleTransactionTypes } from '../../../../lib/enums';
import prisma from '../../../../middleware/prisma';
import { QueryOptions, QuerySort } from '../../../../types';

export interface TransportDashboardVehicleRow {
  id: number;
  vehicleName: string;
  vehicleRegistration: string;
  model: string;
  buyDate: Date | null;
  loanAmount: number;
  expenses: number;
  customerPayments: number;
  customerDueAmount: number;
  balance: number;
}

export interface TransportDashboardVehiclesResponse {
  vehicles: TransportDashboardVehicleRow[];
  totalCount: number;
  totalLoanAmount: number;
  totalExpenses: number;
  totalCustomerPayments: number;
  totalCustomerDueAmount: number;
  totalBalance: number;
}

export async function getTransportVehiclesDashboard(
  options: QueryOptions,
  sort?: QuerySort,
): Promise<TransportDashboardVehiclesResponse> {
  const skip = options?.skip ?? 0;
  const take = options?.take ?? 50;

  const totalCount = await prisma.transportVehicle.count();

  // If sorting by computed balance, build full dataset first, then sort and slice
  const isBalanceSort = !!sort?.balance;
  if (isBalanceSort) {
    if (totalCount === 0) {
      return {
        vehicles: [],
        totalCount: 0,
        totalLoanAmount: 0,
        totalExpenses: 0,
        totalCustomerPayments: 0,
        totalCustomerDueAmount: 0,
        totalBalance: 0,
      };
    }

    const vehicles = await prisma.transportVehicle.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        vehicleName: true,
        vehicleRegistration: true,
        model: true,
        buyDate: true,
      },
    });

    // Group transactions per vehicle by type across ALL vehicles
    const transactions = await prisma.transportVehicleTransaction.groupBy({
      by: ['vehicleId', 'transactionTypeId'],
      where: { deleted: null },
      _sum: { amount: true },
    });

    const LOAN_TYPE = TransportVehicleTransactionTypes.BankLoan;
    const EXPENSE_TYPE = TransportVehicleTransactionTypes.Expense;
    const CUSTOMER_PAYMENT_TYPE = TransportVehicleTransactionTypes.CustomerPayment;

    const loanMap = new Map<number, number>();
    const expenseMap = new Map<number, number>();
    const custPayMap = new Map<number, number>();
    for (const t of transactions) {
      const amt = t._sum.amount ?? 0;
      if (t.transactionTypeId === LOAN_TYPE)
        loanMap.set(t.vehicleId, (loanMap.get(t.vehicleId) ?? 0) + amt);
      else if (t.transactionTypeId === EXPENSE_TYPE)
        expenseMap.set(t.vehicleId, (expenseMap.get(t.vehicleId) ?? 0) + amt);
      else if (t.transactionTypeId === CUSTOMER_PAYMENT_TYPE)
        custPayMap.set(t.vehicleId, (custPayMap.get(t.vehicleId) ?? 0) + amt);
    }

    // Customer due per vehicle: sum(cycle.amount) - sum(payment.amount)
    const cycleSums = await prisma.transportVehicleReservationRentalCycle.groupBy({
      by: ['vehicleReservationId'],
      where: { deleted: null },
      _sum: { amount: true },
    });

    const reservationToVehicle = await prisma.transportVehicleReservation.findMany({
      where: { id: { in: cycleSums.map((c) => c.vehicleReservationId) } },
      select: { id: true, vehicleId: true },
    });
    const reservationVehicleMap = new Map<number, number>(
      reservationToVehicle.map((r) => [r.id, r.vehicleId]),
    );

    const paymentSums = await prisma.transportVehicleReservationRentalCyclePayment.groupBy({
      by: ['vehicleReservationRentalCycleId'],
      where: { deleted: null },
      _sum: { amount: true },
    });

    const cycleToReservation = await prisma.transportVehicleReservationRentalCycle.findMany({
      where: {
        id: { in: [...new Set(paymentSums.map((p) => p.vehicleReservationRentalCycleId))] },
      },
      select: { id: true, vehicleReservationId: true },
    });
    const cycleReservationMap = new Map<number, number>(
      cycleToReservation.map((c) => [c.id, c.vehicleReservationId]),
    );

    const dueMap = new Map<number, number>();
    for (const c of cycleSums) {
      const vehicleId = reservationVehicleMap.get(c.vehicleReservationId);
      if (!vehicleId) continue;
      const rentSum = c._sum.amount ?? 0;

      const paymentsForReservation = paymentSums
        .filter(
          (p) =>
            cycleReservationMap.get(p.vehicleReservationRentalCycleId) === c.vehicleReservationId,
        )
        .reduce((acc, p) => acc + (p._sum.amount ?? 0), 0);

      dueMap.set(vehicleId, (dueMap.get(vehicleId) ?? 0) + (rentSum - paymentsForReservation));
    }

    // Compose and sort rows by balance across ALL vehicles
    let rows: TransportDashboardVehicleRow[] = vehicles.map((v) => {
      const loanAmount = loanMap.get(v.id) ?? 0;
      const expenses = expenseMap.get(v.id) ?? 0;
      const customerPayments = custPayMap.get(v.id) ?? 0;
      const customerDueAmount = dueMap.get(v.id) ?? 0;
      const balance =
        Math.abs(customerPayments) +
        Math.abs(customerDueAmount) -
        (Math.abs(loanAmount) + Math.abs(expenses));
      return {
        id: v.id,
        vehicleName: v.vehicleName,
        vehicleRegistration: v.vehicleRegistration,
        model: v.model,
        buyDate: v.buyDate ?? null,
        loanAmount,
        expenses,
        customerPayments,
        customerDueAmount,
        balance,
      };
    });

    const dir = sort!.balance === 'asc' ? 1 : -1;
    rows.sort((a, b) => (a.balance - b.balance) * dir);

    // Apply paging after full-set sort
    rows = rows.slice(skip, skip + take);

    // Compute grand totals across all vehicles
    const [loanAgg, expenseAgg, custPayAgg, rentAgg, payAgg] = await Promise.all([
      prisma.transportVehicleTransaction.aggregate({
        where: { deleted: null, transactionTypeId: LOAN_TYPE },
        _sum: { amount: true },
      }),
      prisma.transportVehicleTransaction.aggregate({
        where: { deleted: null, transactionTypeId: EXPENSE_TYPE },
        _sum: { amount: true },
      }),
      prisma.transportVehicleTransaction.aggregate({
        where: { deleted: null, transactionTypeId: CUSTOMER_PAYMENT_TYPE },
        _sum: { amount: true },
      }),
      prisma.transportVehicleReservationRentalCycle.aggregate({
        where: { deleted: null },
        _sum: { amount: true },
      }),
      prisma.transportVehicleReservationRentalCyclePayment.aggregate({
        where: { deleted: null },
        _sum: { amount: true },
      }),
    ]);

    const totalLoanAmount = loanAgg._sum.amount ?? 0;
    const totalExpenses = expenseAgg._sum.amount ?? 0;
    const totalCustomerPayments = custPayAgg._sum.amount ?? 0;
    const totalCustomerDueAmount = (rentAgg._sum.amount ?? 0) - (payAgg._sum.amount ?? 0);
    const totalBalance =
      Math.abs(totalCustomerPayments) +
      Math.abs(totalCustomerDueAmount) -
      (Math.abs(totalLoanAmount) + Math.abs(totalExpenses));

    return {
      vehicles: rows,
      totalCount,
      totalLoanAmount,
      totalExpenses,
      totalCustomerPayments,
      totalCustomerDueAmount,
      totalBalance,
    };
  }

  // Default path: page first, then compute aggregates for page
  const vehicles = await prisma.transportVehicle.findMany({
    orderBy: { id: 'desc' },
    skip,
    take,
    select: {
      id: true,
      vehicleName: true,
      vehicleRegistration: true,
      model: true,
      buyDate: true,
    },
  });

  const vehicleIds = vehicles.map((v) => v.id);
  if (vehicleIds.length === 0) {
    // Compute grand totals even if page empty
    const [loanAgg, expenseAgg, custPayAgg, rentAgg, payAgg] = await Promise.all([
      prisma.transportVehicleTransaction.aggregate({
        where: { deleted: null, transactionTypeId: 2 },
        _sum: { amount: true },
      }),
      prisma.transportVehicleTransaction.aggregate({
        where: { deleted: null, transactionTypeId: 4 },
        _sum: { amount: true },
      }),
      prisma.transportVehicleTransaction.aggregate({
        where: { deleted: null, transactionTypeId: 3 },
        _sum: { amount: true },
      }),
      prisma.transportVehicleReservationRentalCycle.aggregate({
        where: { deleted: null },
        _sum: { amount: true },
      }),
      prisma.transportVehicleReservationRentalCyclePayment.aggregate({
        where: { deleted: null },
        _sum: { amount: true },
      }),
    ]);
    const totalLoanAmount = loanAgg._sum.amount ?? 0;
    const totalExpenses = expenseAgg._sum.amount ?? 0;
    const totalCustomerPayments = custPayAgg._sum.amount ?? 0;
    const totalCustomerDueAmount = (rentAgg._sum.amount ?? 0) - (payAgg._sum.amount ?? 0);
    const totalBalance =
      Math.abs(totalCustomerPayments) +
      Math.abs(totalCustomerDueAmount) -
      (Math.abs(totalLoanAmount) + Math.abs(totalExpenses));

    return {
      vehicles: [],
      totalCount,
      totalLoanAmount,
      totalExpenses,
      totalCustomerPayments,
      totalCustomerDueAmount,
      totalBalance,
    };
  }

  // Transactions grouped per vehicle by type (for current page rows)
  const transactions = await prisma.transportVehicleTransaction.groupBy({
    by: ['vehicleId', 'transactionTypeId'],
    where: { vehicleId: { in: vehicleIds }, deleted: null },
    _sum: { amount: true },
  });

  const LOAN_TYPE = TransportVehicleTransactionTypes.BankLoan;
  const EXPENSE_TYPE = TransportVehicleTransactionTypes.Expense;
  const CUSTOMER_PAYMENT_TYPE = TransportVehicleTransactionTypes.CustomerPayment;

  const loanMap = new Map<number, number>();
  const expenseMap = new Map<number, number>();
  const custPayMap = new Map<number, number>();
  for (const t of transactions) {
    const amt = t._sum.amount ?? 0;
    if (t.transactionTypeId === LOAN_TYPE)
      loanMap.set(t.vehicleId, (loanMap.get(t.vehicleId) ?? 0) + amt);
    else if (t.transactionTypeId === EXPENSE_TYPE)
      expenseMap.set(t.vehicleId, (expenseMap.get(t.vehicleId) ?? 0) + amt);
    else if (t.transactionTypeId === CUSTOMER_PAYMENT_TYPE)
      custPayMap.set(t.vehicleId, (custPayMap.get(t.vehicleId) ?? 0) + amt);
  }

  // Customer due per vehicle: sum(cycle.amount) - sum(payment.amount) for reservations of that vehicle
  const cycleSums = await prisma.transportVehicleReservationRentalCycle.groupBy({
    by: ['vehicleReservationId'],
    where: { deleted: null },
    _sum: { amount: true },
  });

  const reservationToVehicle = await prisma.transportVehicleReservation.findMany({
    where: { id: { in: cycleSums.map((c) => c.vehicleReservationId) } },
    select: { id: true, vehicleId: true },
  });
  const reservationVehicleMap = new Map<number, number>(
    reservationToVehicle.map((r) => [r.id, r.vehicleId]),
  );

  const paymentSums = await prisma.transportVehicleReservationRentalCyclePayment.groupBy({
    by: ['vehicleReservationRentalCycleId'],
    where: { deleted: null },
    _sum: { amount: true },
  });

  const cycleToReservation = await prisma.transportVehicleReservationRentalCycle.findMany({
    where: { id: { in: [...new Set(paymentSums.map((p) => p.vehicleReservationRentalCycleId))] } },
    select: { id: true, vehicleReservationId: true },
  });
  const cycleReservationMap = new Map<number, number>(
    cycleToReservation.map((c) => [c.id, c.vehicleReservationId]),
  );

  const dueMap = new Map<number, number>();
  for (const c of cycleSums) {
    const vehicleId = reservationVehicleMap.get(c.vehicleReservationId);
    if (!vehicleId) continue;
    const rentSum = c._sum.amount ?? 0;

    const paymentsForReservation = paymentSums
      .filter(
        (p) =>
          cycleReservationMap.get(p.vehicleReservationRentalCycleId) === c.vehicleReservationId,
      )
      .reduce((acc, p) => acc + (p._sum.amount ?? 0), 0);

    dueMap.set(vehicleId, (dueMap.get(vehicleId) ?? 0) + (rentSum - paymentsForReservation));
  }

  // Compose rows for current page
  const rows = vehicles.map((v) => {
    const loanAmount = loanMap.get(v.id) ?? 0;
    const expenses = expenseMap.get(v.id) ?? 0;
    const customerPayments = custPayMap.get(v.id) ?? 0;
    const customerDueAmount = dueMap.get(v.id) ?? 0;
    const balance =
      Math.abs(customerPayments) +
      Math.abs(customerDueAmount) -
      (Math.abs(loanAmount) + Math.abs(expenses));

    return {
      id: v.id,
      vehicleName: v.vehicleName,
      vehicleRegistration: v.vehicleRegistration,
      model: v.model,
      buyDate: v.buyDate ?? null,
      loanAmount,
      expenses,
      customerPayments,
      customerDueAmount,
      balance,
    };
  });

  // Compute grand totals across all vehicles
  const [loanAgg, expenseAgg, custPayAgg, rentAgg, payAgg] = await Promise.all([
    prisma.transportVehicleTransaction.aggregate({
      where: { deleted: null, transactionTypeId: LOAN_TYPE },
      _sum: { amount: true },
    }),
    prisma.transportVehicleTransaction.aggregate({
      where: { deleted: null, transactionTypeId: EXPENSE_TYPE },
      _sum: { amount: true },
    }),
    prisma.transportVehicleTransaction.aggregate({
      where: { deleted: null, transactionTypeId: CUSTOMER_PAYMENT_TYPE },
      _sum: { amount: true },
    }),
    prisma.transportVehicleReservationRentalCycle.aggregate({
      where: { deleted: null },
      _sum: { amount: true },
    }),
    prisma.transportVehicleReservationRentalCyclePayment.aggregate({
      where: { deleted: null },
      _sum: { amount: true },
    }),
  ]);

  const totalLoanAmount = loanAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;
  const totalCustomerPayments = custPayAgg._sum.amount ?? 0;
  const totalCustomerDueAmount = (rentAgg._sum.amount ?? 0) - (payAgg._sum.amount ?? 0);
  const totalBalance =
    Math.abs(totalCustomerPayments) +
    Math.abs(totalCustomerDueAmount) -
    (Math.abs(totalLoanAmount) + Math.abs(totalExpenses));

  return {
    vehicles: rows,
    totalCount,
    totalLoanAmount,
    totalExpenses,
    totalCustomerPayments,
    totalCustomerDueAmount,
    totalBalance,
  };
}
