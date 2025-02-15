import Joi from 'joi';
import { createVehicleSchema, createVehicleReservationSchema } from './vehicleCreateSchema';

export const updateVehicleSchema = createVehicleSchema.keys({
  id: Joi.number().integer().positive().required(),
});

export const updateVehicleReservationSchema = createVehicleReservationSchema.keys({
  id: Joi.number().integer().positive().required(),
});
