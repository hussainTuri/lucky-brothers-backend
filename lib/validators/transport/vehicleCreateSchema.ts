import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  vehicleName: Joi.string().max(255).required(),
  vehicleRegistration: Joi.string().max(255).required(),
  model: Joi.string().max(255).required(),
  buyDate: Joi.date().optional().allow(null).allow(''),
});
