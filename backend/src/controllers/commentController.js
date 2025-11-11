import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { handleControllerError } from '../utils/errorHandler.js';

const commentSchema = z.object({
  studioId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  assetId: z.string().uuid().optional()
});

export async function listCommentsByStudio(req, res) {
  try {
    const { studioId } = req.params;
    const { assetId, page = '1', limit = '100' } = req.query;
    
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
    const limitNum = Math.min(parseInt(limit, 10), 200); // Max 200 per page
    const skip = (pageNum - 1) * limitNum;
    
    const where = {
      studioId,
      ...(assetId && { assetId })
    };
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.comment.count({ where })
    ]);
    
    res.json({
      comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('List comments error:', error);
    handleControllerError(res, error, 'Gagal memuat komentar');
  }
}

export async function createComment(req, res) {
  try {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    const { studioId, content, assetId } = parsed.data;
    
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
    
    if (!isOwner && !isMember && studio.visibility !== 'PUBLIC') {
      return res.status(403).json({ message: 'Tidak memiliki akses ke studio ini' });
    }
    
    // Validate assetId if provided
    if (assetId) {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId, studioId }
      });
      if (!asset) {
        return res.status(404).json({ message: 'Asset tidak ditemukan di studio ini' });
      }
    }
    
    const comment = await prisma.comment.create({
      data: {
        studioId,
        content: content.trim(),
        assetId,
        authorId: req.user.id
      },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    handleControllerError(res, error, 'Gagal membuat komentar');
  }
}

export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({ 
      where: { id },
      include: {
        studio: {
          select: { ownerId: true, members: { where: { userId: req.user.id }, select: { role: true } } }
        }
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }
    
    const isAuthor = comment.authorId === req.user.id;
    const isOwner = comment.studio.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isStudioAdmin = comment.studio.members[0]?.role === 'ADMIN';
    
    if (!isAuthor && !isOwner && !isAdmin && !isStudioAdmin) {
      return res.status(403).json({ message: 'Tidak memiliki akses menghapus komentar ini' });
    }
    
    await prisma.comment.delete({ where: { id } });
    res.json({ ok: true, message: 'Komentar berhasil dihapus' });
  } catch (error) {
    console.error('Delete comment error:', error);
    handleControllerError(res, error, 'Gagal menghapus komentar');
  }
}


