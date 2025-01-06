import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  customerName: Joi.string().max(255).required(),
  trn: Joi.string().max(255).allow(null).allow('').optional(),
  phone: Joi.string()
    .regex(/^\d{10}$/)
    .message('فون نمبر بالکل 10 ہندسوں کا ہونا چاہیے (0-9)')
    .required(),
  address: Joi.string().max(255).allow(null).allow('').optional(),
  imagePath: Joi.string().max(255).allow(null).allow('').optional(),
});
