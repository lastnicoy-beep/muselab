import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { persistUpload, removeStoredFile } from '../services/fileService.js';
import { handleControllerError } from '../utils/errorHandler.js';

const uploadSchema = z.object({
  studioId: z.string().uuid(),
  type: z.enum(['AUDIO', 'IMAGE', 'TEXT'])
});

export async function uploadAsset(req, res) {
  try {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const { studioId, type } = parsed.data;
    if (!req.file) return res.status(400).json({ message: 'File wajib diunggah' });

    if (type === 'AUDIO' && !req.file.mimetype.startsWith('audio/')) {
      return res.status(400).json({ message: 'Format file tidak sesuai dengan tipe AUDIO' });
    }
    if (type === 'IMAGE' && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Format file tidak sesuai dengan tipe IMAGE' });
    }

    const stored = await persistUpload(req.file);
    const asset = await prisma.asset.create({
      data: {
        studioId,
        type,
        filename: stored.filename,
        mime: stored.mimeType,
        size: stored.size,
        url: stored.publicUrl,
        uploaderId: req.user.id
      },
      include: {
        uploader: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(asset);
  } catch (error) {
    handleControllerError(res, error, 'Gagal mengunggah asset');
  }
}

export async function listAssetsByStudio(req, res) {
  try {
    const { studioId } = req.params;
    const assets = await prisma.asset.findMany({
      where: { studioId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, name: true } }
      }
    });
    res.json(assets);
  } catch (error) {
    handleControllerError(res, error, 'Gagal memuat asset');
  }
}

export async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) return res.status(404).json({ message: 'Asset tidak ditemukan' });
    if (asset.uploaderId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Tidak memiliki akses menghapus asset ini' });
    }
    await prisma.asset.delete({ where: { id } });
    await removeStoredFile(asset.filename);
    res.json({ ok: true });
  } catch (error) {
    handleControllerError(res, error, 'Gagal menghapus asset');
  }
}


