import { Prisma } from '@prisma/client';

export const softDeleteMiddleware: Prisma.Middleware = async (params, next) => {
  const models = [
    'TransportVehicleTransaction',
    'TransportVehicleReservation',
    'TransportVehicleReservationRentalCycle',
    'TransportVehicleReservationRentalCyclePayment',
    'TransportCustomerTransaction',
  ];

  if (models.includes(params.model ?? '')) {
    if (params.action === 'delete') {
      params.action = 'update';
      params.args = {
        where: params.args.where,
        data: { deleted: new Date() }, // Soft delete by setting deleted timestamp
      };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      params.args = {
        where: params.args.where,
        data: { deleted: new Date() },
      };
    }
  }

  return next(params);
};
