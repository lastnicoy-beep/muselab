import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { persistUpload, removeStoredFile } from '../services/fileService.js';
import { handleControllerError } from '../utils/errorHandler.js';

const uploadSchema = z.object({
  studioId: z.string().uuid(),
  type: z.enum(['AUDIO', 'IMAGE', 'TEXT'])
});

// File size limits (in bytes)
const MAX_FILE_SIZES = {
  AUDIO: 50 * 1024 * 1024, // 50MB
  IMAGE: 10 * 1024 * 1024, // 10MB
  TEXT: 5 * 1024 * 1024 // 5MB
};

export async function uploadAsset(req, res) {
  try {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    const { studioId, type } = parsed.data;
    
    // Check studio access
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        owner: { select: { id: true } },
        members: { where: { userId: req.user.id }, select: { userId: true, role: true } }
      }
    });
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    const isOwner = studio.ownerId === req.user.id;
    const isMember = studio.members.length > 0;
    const memberRole = studio.members[0]?.role;
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Tidak memiliki akses ke studio ini' });
    }
    
    if (!isOwner && memberRole === 'VIEWER') {
      return res.status(403).json({ message: 'Viewer tidak dapat mengunggah asset' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'File wajib diunggah' });
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[type];
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        message: `Ukuran file terlalu besar. Maksimal ${(maxSize / 1024 / 1024).toFixed(0)}MB untuk tipe ${type}` 
      });
    }

    // Validate file type
    if (type === 'AUDIO' && !req.file.mimetype.startsWith('audio/')) {
      return res.status(400).json({ message: 'Format file tidak sesuai dengan tipe AUDIO' });
    }
    if (type === 'IMAGE' && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Format file tidak sesuai dengan tipe IMAGE' });
    }
    if (type === 'TEXT' && !['text/plain', 'application/pdf'].includes(req.file.mimetype) && !req.file.mimetype.startsWith('text/')) {
      return res.status(400).json({ message: 'Format file tidak sesuai dengan tipe TEXT' });
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
        uploader: { select: { id: true, name: true, avatar: true } }
      }
    });
    res.status(201).json(asset);
  } catch (error) {
    console.error('Upload asset error:', error);
    handleControllerError(res, error, 'Gagal mengunggah asset');
  }
}

export async function listAssetsByStudio(req, res) {
  try {
    const { studioId } = req.params;
    const { type, page = '1', limit = '50' } = req.query;
    
    // Check studio access
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        owner: { select: { id: true } },
        members: { where: { userId: req.user.id }, select: { userId: true } }
      }
    });
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    const isOwner = studio.ownerId === req.user.id;
    const isMember = studio.members.length > 0;
    
    if (!isOwner && !isMember && studio.visibility !== 'PUBLIC') {
      return res.status(403).json({ message: 'Tidak memiliki akses ke studio ini' });
    }
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;
    
    const where = {
      studioId,
      ...(type && { type })
    };
    
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          uploader: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.asset.count({ where })
    ]);
    
    res.json({
      assets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('List assets error:', error);
    handleControllerError(res, error, 'Gagal memuat asset');
  }
}

export async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({ 
      where: { id },
      include: {
        studio: {
          select: { ownerId: true, members: { where: { userId: req.user.id }, select: { role: true } } }
        }
      }
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset tidak ditemukan' });
    }
    
    const isOwner = asset.studio.ownerId === req.user.id;
    const isUploader = asset.uploaderId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isStudioAdmin = asset.studio.members[0]?.role === 'ADMIN';
    
    if (!isOwner && !isUploader && !isAdmin && !isStudioAdmin) {
      return res.status(403).json({ message: 'Tidak memiliki akses menghapus asset ini' });
    }
    
    await prisma.asset.delete({ where: { id } });
    await removeStoredFile(asset.filename).catch(err => {
      console.error('Failed to remove file:', err);
      // Continue even if file removal fails
    });
    res.json({ ok: true, message: 'Asset berhasil dihapus' });
  } catch (error) {
    console.error('Delete asset error:', error);
    handleControllerError(res, error, 'Gagal menghapus asset');
  }
}


