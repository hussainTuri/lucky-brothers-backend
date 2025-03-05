import { TransportVehicle } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import { createVehicleSchema, updateVehicleSchema } from '../../lib/validators/transport';

const extractVehicleData = (payload: Partial<TransportVehicle>) => {
  return {
    vehicleName: payload.vehicleName ?? null,
    vehicleRegistration: payload.vehicleRegistration ?? null,
    model: payload.model ?? null,
    buyDate: payload.buyDate ? new Date(payload.buyDate) : null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicle>;
  const vehicleEntry = extractVehicleData(payload) as Partial<TransportVehicle>;
  req.body = vehicleEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicle>;
  const vehicleEntry = extractVehicleData(payload) as Partial<TransportVehicle>;
  vehicleEntry.id = payload.id ?? undefined;

  req.body = vehicleEntry;
  next();
};

export const validateCreateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = createVehicleSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = updateVehicleSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
