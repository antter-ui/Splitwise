import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { env } from '../config/env';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        for (const cookie of cookies) {
          const [name, val] = cookie.trim().split('=');
          if (name === 'token') {
            token = val;
            break;
          }
        }
      }

      if (!token) {
        return next(new Error('Authentication required for socket connection'));
      }

      const payload = verifyToken(token);
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token during socket handshake'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    if (userId) {
      // Join personal room for private notifications
      socket.join(`user:${userId}`);
    }

    socket.on('join:group', (groupId: string) => {
      if (groupId) {
        socket.join(`group:${groupId}`);
      }
    });

    socket.on('leave:group', (groupId: string) => {
      if (groupId) {
        socket.leave(`group:${groupId}`);
      }
    });
  });

  return io;
};

export const getIO = (): Server | null => io;

export const emitToGroup = (groupId: string, event: string, payload: any): void => {
  if (io) {
    io.to(`group:${groupId}`).emit(event, payload);
  }
};

export const emitToUser = (userId: string, event: string, payload: any): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
};
