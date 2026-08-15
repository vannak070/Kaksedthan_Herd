import path from 'path';
import fs from 'fs';

/**
 * Storage Configuration Module
 * Separates Development uploads (uploads/dev) vs Production uploads (uploads/prod)
 */
const isProd = process.env.NODE_ENV === 'production';
const uploadSubDir = process.env.UPLOAD_DIR || (isProd ? 'uploads/prod' : 'uploads/dev');

export const STORAGE_CONFIG = {
  environment: process.env.NODE_ENV || 'development',
  uploadSubDir,
  absoluteUploadPath: path.resolve(process.cwd(), 'public', uploadSubDir),
  publicUrlPrefix: `/${uploadSubDir}`,
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

/**
 * Ensure upload directory exists for current environment
 */
export function ensureStorageDirExists(): string {
  const dirPath = STORAGE_CONFIG.absoluteUploadPath;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`[Storage Config] Created environment upload directory: ${dirPath}`);
  }
  return dirPath;
}

/**
 * Resolve public URL for an uploaded file
 */
export function resolvePublicFileUrl(filename: string): string {
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:')) {
    return filename;
  }
  const cleanName = filename.replace(/^\/+/, '');
  if (cleanName.startsWith(STORAGE_CONFIG.uploadSubDir)) {
    return `/${cleanName}`;
  }
  return `${STORAGE_CONFIG.publicUrlPrefix}/${cleanName}`;
}
