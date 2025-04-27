import Joi from 'joi';
import { createVehicleSchema, createVehicleReservationSchema } from './vehicleCreateSchema';

export const updateVehicleSchema = createVehicleSchema.keys({
  id: Joi.number().integer().positive().required(),
});

export const updateVehicleReservationSchema = createVehicleReservationSchema.keys({
  id: Joi.number().integer().positive().required(),
  mulkiyaFilePath: Joi.string().optional().allow(null).allow(''),
});

export const updateVehicleReservationCycleSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const updateVehicleTransactionSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
