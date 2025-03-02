import { Prisma } from '@prisma/client';

export const filterDeletedMiddleware: Prisma.Middleware = async (params, next) => {
  const models = [
    'TransportVehicleTransaction',
    'TransportVehicleReservation',
    'TransportVehicleReservationRentalCycle',
    'TransportVehicleReservationRentalCyclePayment',
    'TransportCustomerTransaction',
  ];

  if (models.includes(params.model ?? '')) {
    // Convert `findUnique` to `findFirst` and apply `deleted: null`
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where = { ...params.args.where, deleted: null };
    }

    // Ensure `findUniqueOrThrow` and `findFirstOrThrow` exclude deleted records
    if (['findFirstOrThrow', 'findUniqueOrThrow'].includes(params.action)) {
      params.args.where = params.args.where ?? {};
      if (params.args.where.deleted === undefined) {
        params.args.where.deleted = null;
      }
    }

    // Ensure `findMany` excludes deleted records unless explicitly requested
    if (params.action === 'findMany') {
      params.args.where = params.args.where ?? {};
      if (params.args.where.deleted === undefined) {
        params.args.where.deleted = null;
      }
    }

    // Ensure `count` excludes deleted records
    if (params.action === 'count') {
      params.args.where = params.args.where ?? {};
      if (params.args.where.deleted === undefined) {
        params.args.where.deleted = null;
      }
    }
  }

  return next(params);
};
