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
  try {
    const ext = mime.extension(file.mimetype) || 'bin';
    const filename = `${uuid()}.${ext}`;
    const dest = path.join(UPLOAD_DIR, filename);
    
    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    }
    
    await fs.promises.rename(file.path, dest);
    return {
      filename,
      mimeType: file.mimetype,
      size: file.size,
      publicUrl: `/uploads/${filename}`
    };
  } catch (error) {
    // Clean up temp file if rename fails
    if (file.path && fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path).catch(() => {});
    }
    throw error;
  }
}

export async function removeStoredFile(filename) {
  if (!filename) return;
  const target = path.join(UPLOAD_DIR, filename);
  try {
    if (fs.existsSync(target)) {
      await fs.promises.unlink(target);
    }
  } catch (error) {
    console.error(`Failed to remove file ${filename}:`, error);
    // Don't throw - file cleanup failure shouldn't break the flow
  }
}


