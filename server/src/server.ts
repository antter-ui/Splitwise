import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database';
import { env } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { groupRoutes } from './modules/groups/groups.routes';
import { groupExpenseRouter, individualExpenseRouter } from './modules/expenses/expenses.routes';
import { groupBalancesRouter, userBalancesRouter } from './modules/balances/balances.routes';
import { settlementRouter } from './modules/settlements/settlements.routes';
import { notificationRoutes } from './modules/notifications/notifications.routes';
import { errorHandler, ApiError } from './middleware/errorHandler';
import { initSocket } from './socket/socket';

const app = express();
const httpServer = http.createServer(app);
const PORT = env.PORT;

// ─── Initialize Socket.IO ─────────────────────────────────────────────────────
initSocket(httpServer);

// ─── Security & Parsers ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'SplitSync server is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups/:groupId/expenses', groupExpenseRouter);
app.use('/api/expenses', individualExpenseRouter);
app.use('/api/groups/:groupId/balances', groupBalancesRouter);
app.use('/api/groups/:groupId/settlements', settlementRouter);
app.use('/api/users/balances', userBalancesRouter);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(ApiError.notFound('The requested endpoint was not found'));
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
};

start();
