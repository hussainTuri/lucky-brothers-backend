import { User } from '@prisma/client';
import { Request } from 'express';

export interface Response {
  success: boolean;
  message: string;
  data: any;
}

export interface AuthenticatedRequest extends Request {
  user?: Partial<User>;
}
