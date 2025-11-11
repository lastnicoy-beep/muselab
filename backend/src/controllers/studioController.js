import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { handleControllerError } from '../utils/errorHandler.js';

const createStudioSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE']).default('PRIVATE')
});

const studioListInclude = {
  owner: { select: { id: true, name: true, avatar: true } },
  members: {
    take: 5,
    include: { user: { select: { id: true, name: true, avatar: true } } }
  },
  _count: { select: { assets: true, comments: true, members: true } }
};

export async function listStudios(req, res) {
  try {
    const userId = req.user.id;
    const { search, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNum - 1) * limitNum;
    
    const where = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ],
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };
    
    const [studios, total] = await Promise.all([
      prisma.studio.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
        include: studioListInclude
      }),
      prisma.studio.count({ where })
    ]);
    
    res.json({
      studios,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('List studios error:', error);
    handleControllerError(res, error, 'Gagal memuat daftar studio');
  }
}

export async function listPublicStudios(req, res) {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNum - 1) * limitNum;
    
    const where = {
      visibility: 'PUBLIC',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };
    
    const [studios, total] = await Promise.all([
      prisma.studio.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
        include: studioListInclude
      }),
      prisma.studio.count({ where })
    ]);
    
    res.json({
      studios,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('List public studios error:', error);
    handleControllerError(res, error, 'Gagal memuat showcase');
  }
}

export async function createStudio(req, res) {
  try {
    const parsed = createStudioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    const data = parsed.data;
    
    // Check user plan limits (FREE plan: 1 studio)
    if (req.user.plan === 'FREE' || !req.user.plan) {
      const ownedCount = await prisma.studio.count({ where: { ownerId: req.user.id } });
      if (ownedCount >= 1) {
        return res.status(403).json({ 
          message: 'Plan FREE hanya dapat memiliki 1 studio. Upgrade ke PRO untuk studio tanpa batas.' 
        });
      }
    }
    
    const studio = await prisma.studio.create({
      data: {
        name: data.name.trim(),
        description: (data.description || '').trim(),
        visibility: data.visibility,
        ownerId: req.user.id,
        members: { create: [{ userId: req.user.id, role: 'ADMIN' }] }
      },
      include: studioListInclude
    });
    res.status(201).json(studio);
  } catch (error) {
    console.error('Create studio error:', error);
    handleControllerError(res, error, 'Gagal membuat studio');
  }
}

export async function getStudio(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const studio = await prisma.studio.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        assets: { 
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit assets for performance
          include: { uploader: { select: { id: true, name: true, avatar: true } } }
        },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
          take: 100 // Limit comments for performance
        },
        members: { 
          include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        },
        _count: { select: { assets: true, comments: true, members: true } }
      }
    });
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    // Check access
    const isOwner = studio.ownerId === userId;
    const isMember = studio.members.some(m => m.userId === userId);
    
    if (!isOwner && !isMember && studio.visibility !== 'PUBLIC') {
      return res.status(403).json({ message: 'Tidak memiliki akses ke studio ini' });
    }
    
    res.json(studio);
  } catch (error) {
    console.error('Get studio error:', error);
    handleControllerError(res, error, 'Gagal memuat detail studio');
  }
}

export async function updateStudio(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user owns the studio or is admin
    const existing = await prisma.studio.findUnique({ 
      where: { id },
      include: {
        members: { where: { userId }, select: { role: true } }
      }
    });
    
    if (!existing) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    const isOwner = existing.ownerId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    const isStudioAdmin = existing.members[0]?.role === 'ADMIN';
    
    if (!isOwner && !isAdmin && !isStudioAdmin) {
      return res.status(403).json({ message: 'Tidak memiliki akses untuk mengupdate studio ini' });
    }

    const parsed = createStudioSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    
    const updateData = {};
    if (parsed.data.name) updateData.name = parsed.data.name.trim();
    if (parsed.data.description !== undefined) updateData.description = (parsed.data.description || '').trim();
    if (parsed.data.visibility) updateData.visibility = parsed.data.visibility;
    
    const studio = await prisma.studio.update({
      where: { id },
      data: updateData,
      include: studioListInclude
    });
    res.json(studio);
  } catch (error) {
    console.error('Update studio error:', error);
    handleControllerError(res, error, 'Gagal memperbarui studio');
  }
}

export async function deleteStudio(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user owns the studio or is admin
    const existing = await prisma.studio.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    if (existing.ownerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Tidak memiliki akses untuk menghapus studio ini' });
    }

    await prisma.studio.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    handleControllerError(res, error, 'Gagal menghapus studio');
  }
}

export async function getStudioInsights(req, res) {
  try {
    const userId = req.user.id;
    const [ownedStudios, membershipStudios, totalAssets, totalComments] = await Promise.all([
      prisma.studio.count({ where: { ownerId: userId } }),
      prisma.member.count({ where: { userId } }),
      prisma.asset.count({
        where: {
          OR: [
            { studio: { ownerId: userId } },
            { studio: { members: { some: { userId } } } }
          ]
        }
      }),
      prisma.comment.count({
        where: {
          OR: [
            { studio: { ownerId: userId } },
            { studio: { members: { some: { userId } } } }
          ]
        }
      })
    ]);

    res.json({
      ownedStudios,
      membershipStudios,
      totalAssets,
      totalComments
    });
  } catch (error) {
    handleControllerError(res, error, 'Gagal memuat ringkasan studio');
  }
}


