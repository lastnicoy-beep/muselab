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
      return res.status(400).json({ message: 'Invalid payment data', errors: parsed.error.flatten() });
    }

    const { plan, method, amount } = parsed.data;
    const userId = req.user.id;
    const finalAmount = amount || PLAN_PRICES[plan];

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        amount: finalAmount,
        method,
        status: 'PENDING',
        reference: generateReference(method)
      },
      include: {
        subscription: true
      }
    });

    // Update user plan (will be verified later)
    await prisma.user.update({
      where: { id: userId },
      data: { plan }
    });

    res.status(201).json({
      payment,
      paymentInfo: getPaymentInfo(method, finalAmount, payment.reference)
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Failed to create payment', error: error.message });
  }
}

export async function getMyPayments(req, res) {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        subscription: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
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
      paymentInfo: getPaymentInfo(payment.method, payment.amount, payment.reference)
    };

    res.json(paymentDetails);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment info', error: error.message });
  }
}

export async function uploadProof(req, res) {
  try {
    const { id } = req.params;
    const { proofUrl, notes } = req.body;

    if (!proofUrl) {
      return res.status(400).json({ message: 'Proof URL is required' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
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
    res.status(500).json({ message: 'Failed to upload proof', error: error.message });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { subscription: true }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status }
    });

    if (status === 'VERIFIED' && payment.subscription) {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'ACTIVE' }
      });

      await prisma.user.update({
        where: { id: payment.userId },
        data: { plan: payment.subscription.plan }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
}

function generateReference(method) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  if (method === 'MANDIRI') {
    return `MDR${timestamp}${random}`;
  }
  return `QRIS${timestamp}${random}`;
}

function getPaymentInfo(method, amount, reference) {
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

