import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  vehicleName: Joi.string().max(255).required(),
  vehicleRegistration: Joi.string().max(255).required(),
  model: Joi.string().max(255).required(),
  buyDate: Joi.date().optional().allow(null).allow(''),
  transport: Joi.string().max(255).optional().allow(null).allow(''),
});

export const createVehicleReservationSchema = Joi.object({
  vehicleId: Joi.number().integer().positive().required(),
  customerId: Joi.number().integer().positive().required(),
  reservationStart: Joi.date().required(),
  reservationEnd: Joi.date().optional().allow(null).allow(''),
  monthlyRate: Joi.number().required().integer().positive(),
  comment: Joi.string().max(255).optional().allow(null).allow(''),
});

export const createVehicleReservationCycleSchema = Joi.object({
  vehicleReservationId: Joi.number().integer().positive().required(),
  customerId: Joi.number().integer().positive().required(),
  rentFrom: Joi.date().required(),
  rentTo: Joi.date().required(),
  amount: Joi.number().required().integer().positive(),
  comment: Joi.string().max(255).optional().allow(null).allow(''),
});

export const createVehicleTransactionSchema = Joi.object({
  vehicleId: Joi.number().integer().positive().required(),
  transactionTypeId: Joi.number().integer().positive().required(),
  bankId: Joi.number().integer().optional().allow(null),
  amount: Joi.number().required().integer(),
  comment: Joi.string().max(255).optional().allow(null).allow(''),
});
