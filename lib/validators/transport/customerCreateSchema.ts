import Joi from 'joi';

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
