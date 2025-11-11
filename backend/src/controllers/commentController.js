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
    const comments = await prisma.comment.findMany({
      where: { studioId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    handleControllerError(res, error, 'Gagal memuat komentar');
  }
}

export async function createComment(req, res) {
  try {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const { studioId, content, assetId } = parsed.data;
    const comment = await prisma.comment.create({
      data: {
        studioId,
        content,
        assetId,
        authorId: req.user.id
      },
      include: { author: { select: { id: true, name: true } } }
    });
    res.status(201).json(comment);
  } catch (error) {
    handleControllerError(res, error, 'Gagal membuat komentar');
  }
}

export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Tidak memiliki akses menghapus komentar ini' });
    }
    await prisma.comment.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    handleControllerError(res, error, 'Gagal menghapus komentar');
  }
}


