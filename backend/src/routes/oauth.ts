import { Router } from 'express';
import { body } from 'express-validator';
import * as oauthController from '../controllers/oauthController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Google OAuth - verify token from frontend
router.post(
  '/google',
  [body('credential').notEmpty()],
  validateRequest,
  oauthController.googleAuth
);

// Facebook OAuth - verify token from frontend
router.post(
  '/facebook',
  [body('accessToken').notEmpty()],
  validateRequest,
  oauthController.facebookAuth
);

export default router;
