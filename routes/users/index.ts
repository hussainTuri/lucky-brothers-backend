import express, { Request, RequestHandler, Response } from 'express';
import {
  normalizeLoginData,
  normalizeRegisterData,
  normalizeUpdateData,
  validateLogin,
  validateRegisterUser,
  validateUpdateUser,
} from '../../middleware/userValidators';
import { registerUser } from './registerUser';
import { getUser } from './getUser';
import { updateUser } from './updateUser';
import { loginUser } from './loginUser';
import { authenticate } from '../../middleware/authenticate';

// Routes requiring authentication
const router = express.Router();
router.get('/:userId',authenticate,  getUser);
router.put('/:userId', authenticate, normalizeUpdateData, validateUpdateUser, updateUser);

// Routes not requiring authentication
router.post('/', normalizeRegisterData, validateRegisterUser, registerUser);
router.post('/login', normalizeLoginData, validateLogin, loginUser);

export default router;
