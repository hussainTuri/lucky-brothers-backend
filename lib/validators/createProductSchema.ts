import Joi from 'joi';

export const createProductSchema = Joi.object({
  sku: Joi.string().max(50).allow(null).optional(),
  productName: Joi.string().max(255).required(),
  productTypeId: Joi.number().integer().positive().required(),
  stockQuantity: Joi.number().integer().default(0).allow(null).optional(),
  manufacturer: Joi.string().max(255).allow(null).allow('').optional(),
  manufacturingYear: Joi.number().integer().allow(null).optional(),
  imagePath: Joi.string().max(255).allow(null).allow('').optional(),
  size: Joi.string().max(255).allow(null).allow('').optional(),
  diameter: Joi.number().integer().allow(null).optional(),
  speedIndex: Joi.string().max(255).allow(null).allow('').optional(),
  loadIndex: Joi.string().max(255).allow(null).allow('').optional(),
  season: Joi.string().max(255).allow(null).allow('').optional(),
  width: Joi.number().integer().allow(null).optional(),
  height: Joi.number().integer().allow(null).optional(),
  length: Joi.number().integer().allow(null).optional(),
  startStop: Joi.number().integer().allow(null).optional(),
  design: Joi.string().max(255).allow(null).allow('').optional(),
  threadSize: Joi.string().max(255).allow(null).allow('').optional(),
  buyingPrice: Joi.number().integer().allow(null).optional(),
  sellingPrice: Joi.number().integer().allow(null).optional(),
});
