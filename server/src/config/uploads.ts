import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import multer, { type Options } from 'multer';
import env from './env.js';

const uploadsPath = path.resolve(process.cwd(), env.uploadDir);

if (!existsSync(uploadsPath)) {
  mkdirSync(uploadsPath, { recursive: true });
}

const sanitizeFilename = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'image';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = sanitizeFilename(path.basename(file.originalname, extension));
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

const imageFileFilter: Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('只允许上传图片文件。'));
  }
  cb(null, true);
};

export const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: env.maxUploadSize }
});

export { uploadsPath };
