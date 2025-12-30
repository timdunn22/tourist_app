import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty(),
    body('role').isIn(['TRAVELER', 'GUIDE']).optional(),
  ],
  validateRequest,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  authController.login
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Forgot password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validateRequest,
  authController.resetPassword
);

// Verify email
router.get('/verify-email/:token', authController.verifyEmail);

// Resend verification
router.post(
  '/resend-verification',
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  authController.resendVerification
);

export default router;
