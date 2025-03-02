import Joi from 'joi';

export const createTransportCustomerSchema = Joi.object({
  customerName: Joi.string().max(255).required(),
  contact1: Joi.string().max(255).allow(null).allow(''),
  contact1Phone: Joi.string().max(15).allow(null).allow(''),
  contact2: Joi.string().max(255).allow(null).allow(''),
  contact2Phone: Joi.string().max(15).allow(null).allow(''),
  phone: Joi.string().max(15).allow(null).allow(''),
  address: Joi.string().max(255).allow(null).allow(''),
});

const createCustomerReservationPayment = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  vehicleId: Joi.number().integer().positive().required(),
  reservationCycleId: Joi.number().integer().positive().required(),
  customerTransactionTypeId: Joi.number().integer().positive().required(),
  amount: Joi.number().integer().required(),
});

// validate array of createCustomerReservationPayment, at least one item
export const createCustomerReservationPaymentsSchema = Joi.array().items(
  createCustomerReservationPayment,
).min(1);

//
