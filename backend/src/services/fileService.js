import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function persistUpload(file) {
  const ext = mime.extension(file.mimetype) || 'bin';
  const filename = `${uuid()}.${ext}`;
  const dest = path.join(UPLOAD_DIR, filename);
  await fs.promises.rename(file.path, dest);
  return {
    filename,
    mimeType: file.mimetype,
    size: file.size,
    publicUrl: `/uploads/${filename}`
  };
}

export async function removeStoredFile(filename) {
  const target = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(target)) {
    await fs.promises.unlink(target);
  }
}


