import { Request, Response } from 'express';
import { PrismaClient, DocumentType, DocumentVerificationStatus, VerificationLevel } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { fileStorage, validateUploadedFile, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE } from '../services/fileStorage';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
  file?: Express.Multer.File;
}

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const validation = validateUploadedFile(file);
    if (!validation.valid) {
      cb(new Error(validation.error));
      return;
    }
    cb(null, true);
  },
}).single('document');

// Document type requirements
const DOCUMENT_REQUIREMENTS: Record<string, { types: DocumentType[]; description: string }> = {
  TRAVELER: {
    types: [DocumentType.PASSPORT, DocumentType.GOVERNMENT_ID, DocumentType.DRIVERS_LICENSE],
    description: 'Valid passport or government-issued ID',
  },
  GUIDE: {
    types: [DocumentType.PASSPORT, DocumentType.GOVERNMENT_ID, DocumentType.CITIZENSHIP, DocumentType.PROFESSIONAL_CERTIFICATE],
    description: 'Valid ID and any professional certifications',
  },
  BUSINESS: {
    types: [DocumentType.BUSINESS_REGISTRATION, DocumentType.PAN_CARD],
    description: 'Business registration documents',
  },
};

/**
 * Upload a verification document
 */
export async function uploadDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentType = req.body.type as DocumentType;
    if (!documentType || !Object.values(DocumentType).includes(documentType)) {
      return res.status(400).json({
        error: 'Invalid document type',
        validTypes: Object.values(DocumentType),
      });
    }

    // Upload file to storage
    const uploadResult = await fileStorage.upload(req.file.buffer, req.file.originalname, {
      folder: `verification/${userId}`,
      mimeType: req.file.mimetype,
      isPrivate: true, // Verification documents are always private
    });

    // Create document record
    const document = await prisma.verificationDocument.create({
      data: {
        userId,
        type: documentType,
        fileName: uploadResult.fileName,
        originalName: uploadResult.originalName,
        filePath: uploadResult.filePath,
        fileSize: uploadResult.size,
        mimeType: uploadResult.mimeType,
        status: DocumentVerificationStatus.PENDING,
        documentNumber: req.body.documentNumber,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      },
    });

    // Log the upload
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPLOAD_DOCUMENT',
        entity: 'VerificationDocument',
        entityId: document.id,
        newValue: {
          type: documentType,
          fileName: uploadResult.fileName,
        },
      },
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        type: document.type,
        status: document.status,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}

/**
 * Get user's verification documents
 */
export async function getDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const documents = await prisma.verificationDocument.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        originalName: true,
        status: true,
        rejectionReason: true,
        expiresAt: true,
        createdAt: true,
        reviewedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
}

/**
 * Delete a pending verification document
 */
export async function deleteDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const document = await prisma.verificationDocument.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only allow deletion of pending documents
    if (document.status !== DocumentVerificationStatus.PENDING) {
      return res.status(400).json({
        error: 'Cannot delete document that is under review or already processed',
      });
    }

    // Delete file from storage
    await fileStorage.delete(document.filePath);

    // Delete record
    await prisma.verificationDocument.delete({
      where: { id: documentId },
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE_DOCUMENT',
        entity: 'VerificationDocument',
        entityId: documentId,
        oldValue: {
          type: document.type,
          fileName: document.fileName,
        },
      },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}

/**
 * Get verification status
 */
export async function getVerificationStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        verificationLevel: true,
        verifiedAt: true,
        role: true,
        verificationDocuments: {
          select: {
            id: true,
            type: true,
            status: true,
            rejectionReason: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get requirements based on role
    const roleKey = user.role === 'GUIDE' ? 'GUIDE' : 'TRAVELER';
    const requirements = DOCUMENT_REQUIREMENTS[roleKey];

    // Check what's approved
    const approvedTypes = user.verificationDocuments
      .filter((d) => d.status === DocumentVerificationStatus.APPROVED)
      .map((d) => d.type);

    const pendingTypes = user.verificationDocuments
      .filter((d) => d.status === DocumentVerificationStatus.PENDING || d.status === DocumentVerificationStatus.UNDER_REVIEW)
      .map((d) => d.type);

    res.json({
      verificationLevel: user.verificationLevel,
      verifiedAt: user.verifiedAt,
      requirements,
      documents: user.verificationDocuments,
      approvedTypes,
      pendingTypes,
      canUploadMore: approvedTypes.length === 0 || pendingTypes.length === 0,
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
}

/**
 * Get document requirements
 */
export async function getDocumentRequirements(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      documentTypes: Object.values(DocumentType),
      requirements: DOCUMENT_REQUIREMENTS,
      allowedMimeTypes: ALLOWED_DOCUMENT_TYPES,
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    });
  } catch (error) {
    console.error('Get requirements error:', error);
    res.status(500).json({ error: 'Failed to get requirements' });
  }
}

// === ADMIN ENDPOINTS ===

/**
 * Get pending verifications (admin)
 */
export async function getPendingVerifications(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status as DocumentVerificationStatus;
    } else {
      // Default to pending and under review
      where.status = {
        in: [DocumentVerificationStatus.PENDING, DocumentVerificationStatus.UNDER_REVIEW],
      };
    }

    if (type && type !== 'all') {
      where.type = type as DocumentType;
    }

    const [documents, total] = await Promise.all([
      prisma.verificationDocument.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' }, // Oldest first for FIFO processing
        skip,
        take: parseInt(limit as string),
      }),
      prisma.verificationDocument.count({ where }),
    ]);

    res.json({
      documents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ error: 'Failed to get pending verifications' });
  }
}

/**
 * Get document details with signed URL (admin)
 */
export async function getDocumentDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const documentId = req.params.id;
    const adminId = req.user?.id;

    const document = await prisma.verificationDocument.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true,
            verificationLevel: true,
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate signed URL for secure viewing (expires in 5 minutes)
    const signedUrl = await fileStorage.getSignedUrl(document.filePath, 300);

    // Log access
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'VIEW_DOCUMENT',
        entity: 'VerificationDocument',
        entityId: documentId,
      },
    });

    // Update to under review if pending
    if (document.status === DocumentVerificationStatus.PENDING) {
      await prisma.verificationDocument.update({
        where: { id: documentId },
        data: { status: DocumentVerificationStatus.UNDER_REVIEW },
      });
    }

    res.json({
      ...document,
      viewUrl: signedUrl,
      urlExpiresIn: 300,
    });
  } catch (error) {
    console.error('Get document details error:', error);
    res.status(500).json({ error: 'Failed to get document details' });
  }
}

/**
 * Review document (admin)
 */
export async function reviewDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const documentId = req.params.id;
    const adminId = req.user?.id;
    const { action, rejectionReason, adminNotes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const document = await prisma.verificationDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const newStatus =
      action === 'approve'
        ? DocumentVerificationStatus.APPROVED
        : DocumentVerificationStatus.REJECTED;

    // Update document
    await prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        status: newStatus,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: action === 'reject' ? rejectionReason : null,
        adminNotes,
      },
    });

    // If approved, update user's verification level
    if (action === 'approve') {
      // Check if this is their first approved ID document
      const approvedIdDocs = await prisma.verificationDocument.count({
        where: {
          userId: document.userId,
          status: DocumentVerificationStatus.APPROVED,
          type: {
            in: [DocumentType.PASSPORT, DocumentType.GOVERNMENT_ID, DocumentType.DRIVERS_LICENSE],
          },
        },
      });

      if (approvedIdDocs >= 1) {
        // Update to ID_VERIFIED
        await prisma.user.update({
          where: { id: document.userId },
          data: {
            verificationLevel: VerificationLevel.ID_VERIFIED,
            verifiedAt: new Date(),
          },
        });

        // If guide, also mark guide as verified
        if (document.user.role === 'GUIDE') {
          await prisma.guide.updateMany({
            where: { userId: document.userId },
            data: {
              verified: true,
              verifiedAt: new Date(),
            },
          });
        }
      }
    }

    // Log the review
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: action === 'approve' ? 'APPROVE_DOCUMENT' : 'REJECT_DOCUMENT',
        entity: 'VerificationDocument',
        entityId: documentId,
        newValue: {
          status: newStatus,
          rejectionReason: action === 'reject' ? rejectionReason : null,
        },
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: document.userId,
        type: action === 'approve' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
        title: action === 'approve' ? 'Document Approved' : 'Document Rejected',
        message:
          action === 'approve'
            ? 'Your verification document has been approved!'
            : `Your verification document was rejected: ${rejectionReason}`,
        data: { documentId, documentType: document.type },
      },
    });

    res.json({
      message: `Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      status: newStatus,
    });
  } catch (error) {
    console.error('Review document error:', error);
    res.status(500).json({ error: 'Failed to review document' });
  }
}

/**
 * Get verification statistics (admin)
 */
export async function getVerificationStats(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalPending,
      totalUnderReview,
      totalApproved,
      totalRejected,
      verifiedUsers,
      recentVerifications,
    ] = await Promise.all([
      prisma.verificationDocument.count({
        where: { status: DocumentVerificationStatus.PENDING },
      }),
      prisma.verificationDocument.count({
        where: { status: DocumentVerificationStatus.UNDER_REVIEW },
      }),
      prisma.verificationDocument.count({
        where: { status: DocumentVerificationStatus.APPROVED },
      }),
      prisma.verificationDocument.count({
        where: { status: DocumentVerificationStatus.REJECTED },
      }),
      prisma.user.count({
        where: {
          verificationLevel: {
            in: [VerificationLevel.ID_VERIFIED, VerificationLevel.FULLY_VERIFIED],
          },
        },
      }),
      prisma.verificationDocument.findMany({
        where: {
          status: {
            in: [DocumentVerificationStatus.APPROVED, DocumentVerificationStatus.REJECTED],
          },
        },
        take: 10,
        orderBy: { reviewedAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    res.json({
      stats: {
        pending: totalPending,
        underReview: totalUnderReview,
        approved: totalApproved,
        rejected: totalRejected,
        verifiedUsers,
      },
      recentVerifications,
    });
  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({ error: 'Failed to get verification stats' });
  }
}
