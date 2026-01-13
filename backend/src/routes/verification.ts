import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  uploadDocument,
  uploadMiddleware,
  getDocuments,
  deleteDocument,
  getVerificationStatus,
  getDocumentRequirements,
  getPendingVerifications,
  getDocumentDetails,
  reviewDocument,
  getVerificationStats,
} from '../controllers/verificationController';

const router = Router();

// === USER ROUTES (require authentication) ===

/**
 * POST /api/verification/upload
 * Upload a verification document
 */
router.post('/upload', authenticate, uploadMiddleware, uploadDocument);

/**
 * GET /api/verification/documents
 * Get user's verification documents
 */
router.get('/documents', authenticate, getDocuments);

/**
 * DELETE /api/verification/documents/:id
 * Delete a pending verification document
 */
router.delete('/documents/:id', authenticate, deleteDocument);

/**
 * GET /api/verification/status
 * Get user's verification status
 */
router.get('/status', authenticate, getVerificationStatus);

/**
 * GET /api/verification/requirements
 * Get document requirements and allowed types
 */
router.get('/requirements', authenticate, getDocumentRequirements);

// === ADMIN ROUTES ===

/**
 * GET /api/verification/admin/pending
 * Get pending verification documents (admin only)
 */
router.get('/admin/pending', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), getPendingVerifications);

/**
 * GET /api/verification/admin/:id
 * Get document details with secure viewing URL (admin only)
 */
router.get('/admin/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), getDocumentDetails);

/**
 * PUT /api/verification/admin/:id
 * Review (approve/reject) a verification document (admin only)
 */
router.put('/admin/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), reviewDocument);

/**
 * GET /api/verification/admin/stats
 * Get verification statistics (admin only)
 */
router.get('/admin/stats', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), getVerificationStats);

export default router;
