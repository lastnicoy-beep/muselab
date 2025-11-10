import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { registerSocketHandlers } from './services/socketService.js';

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MuseLab backend running on http://localhost:${PORT}`);
});


