import Joi from 'joi';
import { createVehicleSchema } from './vehicleCreateSchema';

export const updateVehicleSchema = createVehicleSchema.keys({
  id: Joi.number().integer().positive().required(),
});
