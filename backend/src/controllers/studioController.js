import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { handleControllerError } from '../utils/errorHandler.js';

const prisma = new PrismaClient();

const createStudioSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE']).default('PRIVATE')
});

const studioListInclude = {
  owner: { select: { id: true, name: true } },
  members: {
    take: 5,
    include: { user: { select: { id: true, name: true } } }
  },
  _count: { select: { assets: true, comments: true, members: true } }
};

export async function listStudios(req, res) {
  try {
    const userId = req.user.id;
    const studios = await prisma.studio.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: studioListInclude
    });
    res.json(studios);
  } catch (error) {
    handleControllerError(res, error, 'Gagal memuat daftar studio');
  }
}

export async function listPublicStudios(_req, res) {
  try {
    const studios = await prisma.studio.findMany({
      where: { visibility: 'PUBLIC' },
      orderBy: { updatedAt: 'desc' },
      include: studioListInclude
    });
    res.json(studios);
  } catch (error) {
    handleControllerError(res, error, 'Gagal memuat showcase');
  }
}

export async function createStudio(req, res) {
  try {
    const parsed = createStudioSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const data = parsed.data;
    const studio = await prisma.studio.create({
      data: {
        name: data.name,
        description: data.description || '',
        visibility: data.visibility,
        ownerId: req.user.id,
        members: { create: [{ userId: req.user.id, role: 'ADMIN' }] }
      },
      include: studioListInclude
    });
    res.status(201).json(studio);
  } catch (error) {
    handleControllerError(res, error, 'Gagal membuat studio');
  }
}

export async function getStudio(req, res) {
  try {
    const { id } = req.params;
    const studio = await prisma.studio.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
        assets: { orderBy: { createdAt: 'desc' } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        members: { include: { user: { select: { id: true, name: true } } } },
        _count: { select: { assets: true, comments: true, members: true } }
      }
    });
    if (!studio) return res.status(404).json({ message: 'Studio tidak ditemukan' });
    res.json(studio);
  } catch (error) {
    handleControllerError(res, error, 'Gagal memuat detail studio');
  }
}

export async function updateStudio(req, res) {
  try {
    const { id } = req.params;
    const parsed = createStudioSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const studio = await prisma.studio.update({
      where: { id },
      data: parsed.data,
      include: studioListInclude
    });
    res.json(studio);
  } catch (error) {
    handleControllerError(res, error, 'Gagal memperbarui studio');
  }
}

export async function deleteStudio(req, res) {
  try {
    const { id } = req.params;
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


