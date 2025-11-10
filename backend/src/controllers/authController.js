import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6)
});

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { email, name, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, password: hash, role: 'EDITOR', plan: 'FREE' },
    select: { id: true, email: true, name: true, role: true, plan: true }
  });
  const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.status(201).json({ user, token });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const payload = { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan || 'FREE' };
  const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.json({ user: payload, token });
}


