import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import studioRoutes from './routes/studioRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(hpp());
app.use(xss());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads', { maxAge: '1d', fallthrough: false }));

app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'muselab-backend' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;


