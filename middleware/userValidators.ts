import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../lib/response';
import { createUserSchema, loginUserSchema, updateUserSchema } from '../lib/validators/';
import { UCFirstLCRest, trimSpaces } from '../lib/utils';

export const extractUserData = (payload: Partial<User>) => {
  return {
    fullName: UCFirstLCRest(trimSpaces((payload.fullName as string) ?? null)),
    username: trimSpaces((payload.username as string) ?? null),
    password: payload.password ?? null,
    phone: payload.phone ?? null,
    address: payload.address ?? null,
  };
};

export const normalizeRegisterData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<User>;
  const user = extractUserData(payload) as Partial<User>;
  req.body = user;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<User>;
  const user = extractUserData(payload) as Partial<User>;
  user.id = req.body.id ?? 0;
  req.body = user;
  next();
};

export const normalizeLoginData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<User>;
  const { username, password } = extractUserData(payload) as Partial<User>;
  req.body = { ...req.body, username, password };
  next();
};

export const validateRegisterUser = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = createUserSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateUser = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = updateUserSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = loginUserSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
