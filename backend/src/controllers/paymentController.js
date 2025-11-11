import { z } from 'zod';
import prisma from '../utils/prisma.js';

const MANDIRI_ACCOUNT = '1080028325505';
const QRIS_NMID = 'ID1025445733781';

const createPaymentSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
  method: z.enum(['MANDIRI', 'QRIS']),
  amount: z.number().positive().optional()
});

const PLAN_PRICES = {
  PRO: 50000, // Rp 50.000/bulan
  ENTERPRISE: 200000 // Rp 200.000/bulan
};

export async function createPayment(req, res) {
  try {
    const parsed = createPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }

    const { plan, method, amount } = parsed.data;
    const userId = req.user.id;
    const finalAmount = amount || PLAN_PRICES[plan];

    // Check if user already has active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() }
      }
    });

    if (activeSubscription && activeSubscription.plan === plan) {
      return res.status(400).json({ message: 'Anda sudah memiliki subscription aktif untuk plan ini' });
    }

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'PENDING', // Will be ACTIVE after payment verification
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Create payment record
    const reference = generateReference(method);
    const payment = await prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        amount: finalAmount,
        method,
        status: 'PENDING',
        reference
      },
      include: {
        subscription: true
      }
    });

    res.status(201).json({
      payment,
      paymentInfo: getPaymentInfoHelper(method, finalAmount, reference)
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Failed to create payment' });
  }
}

export async function getMyPayments(req, res) {
  try {
    const userId = req.user.id;
    const { status, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNum - 1) * limitNum;
    
    const where = {
      userId,
      ...(status && { status })
    };
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          subscription: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.payment.count({ where })
    ]);
    
    res.json({
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
}

export async function getPaymentInfo(req, res) {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const paymentDetails = {
      ...payment,
      paymentInfo: getPaymentInfoHelper(payment.method, payment.amount, payment.reference)
    };

    res.json(paymentDetails);
  } catch (error) {
    console.error('Get payment info error:', error);
    res.status(500).json({ message: 'Failed to fetch payment info' });
  }
}

const proofSchema = z.object({
  proofUrl: z.string().url().max(500),
  notes: z.string().max(500).optional()
});

export async function uploadProof(req, res) {
  try {
    const { id } = req.params;
    const parsed = proofSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    
    const { proofUrl, notes } = parsed.data;

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (payment.status === 'VERIFIED') {
      return res.status(400).json({ message: 'Payment already verified' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        proofUrl,
        notes: notes || null,
        status: 'PENDING' // Reset to pending for admin verification
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({ message: 'Failed to upload proof' });
  }
}

const verifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().max(500).optional()
});

export async function verifyPayment(req, res) {
  try {
    const { id } = req.params;
    const parsed = verifySchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors 
      });
    }
    
    const { status, notes } = parsed.data;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { subscription: true }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { 
        status,
        notes: notes || payment.notes
      }
    });

    if (status === 'VERIFIED' && payment.subscription) {
      // Cancel any other active subscriptions
      await prisma.subscription.updateMany({
        where: {
          userId: payment.userId,
          status: 'ACTIVE',
          id: { not: payment.subscriptionId }
        },
        data: { status: 'CANCELLED' }
      });

      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'ACTIVE' }
      });

      await prisma.user.update({
        where: { id: payment.userId },
        data: { plan: payment.subscription.plan }
      });
    } else if (status === 'REJECTED' && payment.subscription) {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'CANCELLED' }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
}

function generateReference(method) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  if (method === 'MANDIRI') {
    return `MDR${timestamp}${random}`;
  }
  return `QRIS${timestamp}${random}`;
}

function getPaymentInfoHelper(method, amount, reference) {
  if (method === 'MANDIRI') {
    return {
      method: 'MANDIRI',
      accountNumber: MANDIRI_ACCOUNT,
      accountName: 'RIYAN PERDHANA PUTRA',
      amount,
      reference,
      instructions: [
        'Transfer ke rekening Bank Mandiri',
        `Nomor rekening: ${MANDIRI_ACCOUNT}`,
        `Atas nama: RIYAN PERDHANA PUTRA`,
        `Jumlah: Rp ${amount.toLocaleString('id-ID')}`,
        `Referensi: ${reference}`,
        'Setelah transfer, upload bukti pembayaran di halaman ini'
      ]
    };
  }

  if (method === 'QRIS') {
    return {
      method: 'QRIS',
      nmid: QRIS_NMID,
      merchantName: 'RIYAN PERDHANA PUTRA, WEBSIT, DIGITAL & KREATIF',
      amount,
      reference,
      instructions: [
        'Buka aplikasi pembayaran dengan logo QRIS',
        'Scan QR code yang ditampilkan',
        'Cek jumlah pembayaran: Rp ' + amount.toLocaleString('id-ID'),
        'Lakukan pembayaran',
        'Setelah pembayaran, upload bukti pembayaran di halaman ini'
      ],
      qrisUrl: `https://api.qris.id/payment/${QRIS_NMID}?amount=${amount}&ref=${reference}`
    };
  }

  return null;
}

