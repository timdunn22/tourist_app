import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

// File storage interface - can be implemented by local or S3
export interface IFileStorage {
  upload(file: Buffer, fileName: string, options?: UploadOptions): Promise<UploadResult>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
  getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
  exists(filePath: string): Promise<boolean>;
}

export interface UploadOptions {
  folder?: string;
  mimeType?: string;
  isPrivate?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  filePath: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
}

// Local file storage implementation (for development)
export class LocalFileStorage implements IFileStorage {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  async upload(file: Buffer, fileName: string, options: UploadOptions = {}): Promise<UploadResult> {
    const folder = options.folder || 'general';
    const uploadDir = path.join(this.baseDir, folder);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(fileName);
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(folder, uniqueName);
    const fullPath = path.join(this.baseDir, filePath);

    // Write file
    await writeFile(fullPath, file);

    // Get file stats
    const stats = await stat(fullPath);

    return {
      filePath,
      fileName: uniqueName,
      originalName: fileName,
      size: stats.size,
      mimeType: options.mimeType || 'application/octet-stream',
      url: `${this.baseUrl}/uploads/${filePath}`,
    };
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, filePath);
    return readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async getSignedUrl(filePath: string, _expiresIn: number = 300): Promise<string> {
    // For local storage, we generate a simple token-based URL
    // In production, this should be replaced with proper signed URLs
    const token = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(filePath + Date.now())
      .digest('hex')
      .substring(0, 16);

    return `${this.baseUrl}/api/files/${encodeURIComponent(filePath)}?token=${token}`;
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await stat(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

// S3 file storage implementation (for production)
export class S3FileStorage implements IFileStorage {
  private s3Client: any;
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'us-east-1';

    // Lazy-load AWS SDK only when needed
    if (process.env.FILE_STORAGE_TYPE === 's3') {
      this.initializeS3Client();
    }
  }

  private async initializeS3Client() {
    try {
      // Dynamic import for AWS SDK
      const { S3Client } = await import('@aws-sdk/client-s3');

      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });
    } catch (error) {
      console.error('Failed to initialize S3 client:', error);
      throw new Error('S3 client initialization failed. Make sure @aws-sdk/client-s3 is installed.');
    }
  }

  async upload(file: Buffer, fileName: string, options: UploadOptions = {}): Promise<UploadResult> {
    if (!this.s3Client) {
      await this.initializeS3Client();
    }

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    const folder = options.folder || 'general';
    const ext = path.extname(fileName);
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const key = `${folder}/${uniqueName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: options.mimeType || 'application/octet-stream',
      Metadata: options.metadata,
      // Private by default for sensitive documents
      ACL: options.isPrivate ? 'private' : 'public-read',
    });

    await this.s3Client.send(command);

    return {
      filePath: key,
      fileName: uniqueName,
      originalName: fileName,
      size: file.length,
      mimeType: options.mimeType || 'application/octet-stream',
      url: options.isPrivate
        ? '' // Private files use signed URLs
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
    };
  }

  async download(filePath: string): Promise<Buffer> {
    if (!this.s3Client) {
      await this.initializeS3Client();
    }

    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    const response = await this.s3Client.send(command);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async delete(filePath: string): Promise<void> {
    if (!this.s3Client) {
      await this.initializeS3Client();
    }

    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(filePath: string, expiresIn: number = 300): Promise<string> {
    if (!this.s3Client) {
      await this.initializeS3Client();
    }

    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async exists(filePath: string): Promise<boolean> {
    if (!this.s3Client) {
      await this.initializeS3Client();
    }

    const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}

// Factory function to create the appropriate storage instance
function createFileStorage(): IFileStorage {
  const storageType = process.env.FILE_STORAGE_TYPE || 'local';

  if (storageType === 's3') {
    return new S3FileStorage();
  }

  return new LocalFileStorage();
}

// Singleton instance
export const fileStorage = createFileStorage();

// Helper function to determine MIME type from filename
export function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Allowed file types for verification documents
export const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Validate uploaded file
export function validateUploadedFile(
  file: { mimetype: string; size: number },
  allowedTypes: string[] = ALLOWED_DOCUMENT_TYPES,
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  return { valid: true };
}
