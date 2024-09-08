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
import { getUsers } from './getUsers';

// Routes requiring authentication
const router = express.Router();
router.get('/', authenticate, getUsers);
router.get('/:userId', authenticate, getUser);
router.put('/:userId', authenticate, normalizeUpdateData, validateUpdateUser, updateUser);
router.post('/', authenticate, normalizeRegisterData, validateRegisterUser, registerUser); // only logged in users can create new users
// router.get('/', authenticate, getUsers);

// Routes not requiring authentication
router.post('/login', normalizeLoginData, validateLogin, loginUser);

export default router;
