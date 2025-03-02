import { Prisma } from '@prisma/client';

export const updateMiddleware: Prisma.Middleware = async (params, next) => {
  const models = [
    'TransportVehicleTransaction',
    'TransportVehicleReservation',
    'TransportVehicleReservationRentalCycle',
    'TransportVehicleReservationRentalCyclePayment',
    'TransportCustomerTransaction',
  ];

  if (models.includes(params.model ?? '')) {
    if (params.action === 'update') {
      // Convert single update to updateMany
      params.action = 'updateMany';

      // Ensure update only applies to non-deleted records
      if (!params.args.where) {
        params.args.where = { deleted: null };
      } else if (params.args.where.deleted === undefined) {
        params.args.where.deleted = null;
      }
    }

    if (params.action === 'updateMany') {
      // Ensure updates only modify non-deleted records
      if (!params.args.where) {
        params.args.where = { deleted: null };
      } else if (params.args.where.deleted === undefined) {
        params.args.where.deleted = null;
      }
    }
  }

  return next(params);
};
