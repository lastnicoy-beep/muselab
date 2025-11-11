import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma.js';

// Validate JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).max(100).trim(),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

export async function register(req, res) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    const { email, name, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 12); // Increased rounds for better security
    const user = await prisma.user.create({
      data: { email, name, password: hash, provider: 'email', role: 'EDITOR', plan: 'FREE' },
      select: { id: true, email: true, name: true, role: true, plan: true, avatar: true }
    });
    const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1)
});

export async function login(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.password) {
      return res.status(401).json({ message: 'Please use OAuth login for this account' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan || 'FREE', avatar: user.avatar };
    const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: payload, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const oauthSchema = z.object({
  provider: z.enum(['google', 'github']),
  providerId: z.string().min(1).max(255),
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).max(100).trim(),
  avatar: z.string().url().max(500).optional()
});

export async function oauth(req, res) {
  try {
    const parsed = oauthSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    const { provider, providerId, email, name, avatar } = parsed.data;
    
    // Cari user berdasarkan email atau providerId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { provider, providerId }
        ]
      }
    });

    if (user) {
      // Update user jika sudah ada (update avatar, name jika berubah)
      if (user.provider !== provider || user.providerId !== providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { provider, providerId, avatar, name }
        });
      } else if (avatar && user.avatar !== avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar, name }
        });
      }
    } else {
      // Buat user baru untuk OAuth
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider,
          providerId,
          avatar,
          role: 'EDITOR',
          plan: 'FREE'
        }
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan || 'FREE',
      avatar: user.avatar
    };
    
    const token = jwt.sign(
      { sub: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ user: payload, token });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function githubCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      console.error('GitHub OAuth credentials not configured');
      return res.status(500).json({ message: 'OAuth service not configured' });
    }
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description || 'Failed to get access token' });
    }

    const { access_token } = tokenData;

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json'
      }
    });

    if (!userResponse.ok) {
      return res.status(400).json({ message: 'Failed to get user info from GitHub' });
    }

    const githubUser = await userResponse.json();

    // Get user email (might need separate API call)
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json'
        }
      });
      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find(e => e.primary) || emails[0];
        email = primaryEmail?.email;
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Email not available from GitHub' });
    }

    // Return user data to frontend
    res.json({
      id: githubUser.id,
      email,
      name: githubUser.name || githubUser.login,
      avatar_url: githubUser.avatar_url,
      login: githubUser.login
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ message: 'Internal server error during GitHub OAuth' });
  }
}


