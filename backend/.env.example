import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import zoneRoutes from './modules/zone/zone.routes';
import rateRoutes from './modules/rate/rate.routes';
import orderRoutes from './modules/order/order.routes';
import agentRoutes from './modules/agent/agent.routes';
import trackingRoutes from './modules/tracking/tracking.routes';

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: true, // Dynamically allow any origin (great for prototyping/assignments)
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Root and API welcomes
app.get('/', (_req, res) => {
  res.json({ message: 'LastMileUS API is running', health: '/api/health' });
});

app.get('/api', (_req, res) => {
  res.json({ message: 'LastMileUS API is running', health: '/api/health' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', zoneRoutes);
app.use('/api/rate-cards', rateRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/tracking', trackingRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
});

export default app;