import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { handleControllerError } from '../utils/errorHandler.js';

const addMemberSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('EDITOR')
});

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER'])
});

export async function listMembers(req, res) {
  try {
    const { studioId } = req.params;
    const userId = req.user.id;
    
    // Check studio access
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        owner: { select: { id: true } },
        members: { where: { userId }, select: { userId: true } }
      }
    });
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    const isOwner = studio.ownerId === userId;
    const isMember = studio.members.length > 0;
    
    if (!isOwner && !isMember && studio.visibility !== 'PUBLIC') {
      return res.status(403).json({ message: 'Tidak memiliki akses ke studio ini' });
    }
    
    const members = await prisma.member.findMany({
      where: { studioId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(members);
  } catch (error) {
    console.error('List members error:', error);
    handleControllerError(res, error, 'Gagal memuat daftar anggota');
  }
}

export async function addMember(req, res) {
  try {
    const { studioId } = req.params;
    const userId = req.user.id;
    const parsed = addMemberSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    
    const { email, role } = parsed.data;
    
    // Check studio access and permissions
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        owner: { select: { id: true } },
        members: { where: { userId }, select: { role: true } }
      }
    });
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    const isOwner = studio.ownerId === userId;
    const isStudioAdmin = studio.members[0]?.role === 'ADMIN';
    
    if (!isOwner && !isStudioAdmin) {
      return res.status(403).json({ message: 'Hanya owner atau admin studio yang dapat menambahkan anggota' });
    }
    
    // Find user by email
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User dengan email tersebut tidak ditemukan' });
    }
    
    if (userToAdd.id === userId) {
      return res.status(400).json({ message: 'Tidak dapat menambahkan diri sendiri sebagai anggota' });
    }
    
    // Check if already a member
    const existingMember = await prisma.member.findUnique({
      where: {
        userId_studioId: {
          userId: userToAdd.id,
          studioId
        }
      }
    });
    
    if (existingMember) {
      return res.status(409).json({ message: 'User sudah menjadi anggota studio ini' });
    }
    
    // Check member limit based on plan
    const memberCount = await prisma.member.count({ where: { studioId } });
    const owner = await prisma.user.findUnique({ where: { id: studio.ownerId }, select: { plan: true } });
    
    if (owner?.plan === 'FREE' && memberCount >= 2) { // FREE: owner + 2 members = 3 total
      return res.status(403).json({ message: 'Plan FREE hanya dapat memiliki maksimal 3 anggota (termasuk owner). Upgrade ke PRO untuk anggota tanpa batas.' });
    }
    
    const member = await prisma.member.create({
      data: {
        studioId,
        userId: userToAdd.id,
        role
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });
    
    res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    handleControllerError(res, error, 'Gagal menambahkan anggota');
  }
}

export async function updateMember(req, res) {
  try {
    const { studioId, memberId } = req.params;
    const userId = req.user.id;
    const parsed = updateMemberSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    
    const { role } = parsed.data;
    
    // Check studio access and permissions
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        owner: { select: { id: true } },
        members: { where: { userId }, select: { role: true } }
      }
    });
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    const isOwner = studio.ownerId === userId;
    const isStudioAdmin = studio.members[0]?.role === 'ADMIN';
    
    if (!isOwner && !isStudioAdmin) {
      return res.status(403).json({ message: 'Hanya owner atau admin studio yang dapat mengupdate peran anggota' });
    }
    
    const member = await prisma.member.findUnique({
      where: { id: memberId, studioId }
    });
    
    if (!member) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }
    
    // Prevent changing owner's role
    if (member.userId === studio.ownerId) {
      return res.status(400).json({ message: 'Tidak dapat mengubah peran owner' });
    }
    
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update member error:', error);
    handleControllerError(res, error, 'Gagal memperbarui peran anggota');
  }
}

export async function removeMember(req, res) {
  try {
    const { studioId, memberId } = req.params;
    const userId = req.user.id;
    
    // Check studio access and permissions
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        owner: { select: { id: true } },
        members: { where: { userId }, select: { role: true } }
      }
    });
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio tidak ditemukan' });
    }
    
    const isOwner = studio.ownerId === userId;
    const isStudioAdmin = studio.members[0]?.role === 'ADMIN';
    
    const member = await prisma.member.findUnique({
      where: { id: memberId, studioId }
    });
    
    if (!member) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }
    
    // Allow self-removal or owner/admin removal
    const isSelf = member.userId === userId;
    
    if (!isOwner && !isStudioAdmin && !isSelf) {
      return res.status(403).json({ message: 'Tidak memiliki akses untuk menghapus anggota ini' });
    }
    
    // Prevent removing owner
    if (member.userId === studio.ownerId) {
      return res.status(400).json({ message: 'Tidak dapat menghapus owner dari studio' });
    }
    
    await prisma.member.delete({ where: { id: memberId } });
    res.json({ ok: true, message: 'Anggota berhasil dihapus' });
  } catch (error) {
    console.error('Remove member error:', error);
    handleControllerError(res, error, 'Gagal menghapus anggota');
  }
}

