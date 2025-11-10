import jwt from 'jsonwebtoken';

const studioPresence = new Map(); // studioId -> Map<userId, { userId, name }>

function getTokenFromHandshake(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;
  const header = socket.handshake.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

function addPresence(studioId, user) {
  if (!studioPresence.has(studioId)) {
    studioPresence.set(studioId, new Map());
  }
  studioPresence.get(studioId).set(user.userId, user);
}

function removePresence(studioId, userId) {
  const room = studioPresence.get(studioId);
  if (!room) return;
  room.delete(userId);
  if (room.size === 0) {
    studioPresence.delete(studioId);
  }
}

export function registerSocketHandlers(io) {
  io.use((socket, next) => {
    try {
      const token = getTokenFromHandshake(socket);
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      socket.data.user = {
        id: decoded.sub,
        name: decoded.name || 'User',
        role: decoded.role || 'VIEWER'
      };
      socket.data.joinedStudios = new Set();
      return next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_studio', ({ studioId }) => {
      if (!studioId || !socket.data.user) return;
      const user = { userId: socket.data.user.id, name: socket.data.user.name };
      socket.join(studioId);
      socket.data.joinedStudios.add(studioId);
      addPresence(studioId, user);
      const currentPresence = Array.from(studioPresence.get(studioId)?.values() ?? []);
      socket.emit('active_users', currentPresence);
      socket.to(studioId).emit('user_joined', user);
    });

    socket.on('update_asset', ({ studioId, payload }) => {
      if (!socket.data.joinedStudios?.has(studioId)) return;
      socket.to(studioId).emit('asset_updated', payload);
    });

    socket.on('add_comment', ({ studioId, payload }) => {
      if (!socket.data.joinedStudios?.has(studioId)) return;
      socket.to(studioId).emit('comment_added', payload);
    });

    socket.on('delete_asset', ({ studioId, assetId }) => {
      if (!socket.data.joinedStudios?.has(studioId)) return;
      socket.to(studioId).emit('asset_deleted', { assetId });
    });

    socket.on('canvas_note_update', ({ studioId, payload }) => {
      if (!socket.data.joinedStudios?.has(studioId)) return;
      socket.to(studioId).emit('canvas_note_updated', payload);
    });

    socket.on('studio_chat', ({ studioId, payload }) => {
      if (!socket.data.joinedStudios?.has(studioId)) return;
      socket.to(studioId).emit('studio_chat', payload);
    });

    socket.on('cursor_move', ({ studioId, cursor }) => {
      if (!socket.data.joinedStudios?.has(studioId)) return;
      socket.to(studioId).emit('cursor_moved', { ...cursor, userId: socket.data.user?.id });
    });

    socket.on('leave_studio', ({ studioId }) => {
      if (!studioId || !socket.data.joinedStudios?.has(studioId)) return;
      socket.leave(studioId);
      socket.data.joinedStudios.delete(studioId);
      removePresence(studioId, socket.data.user?.id);
      socket.to(studioId).emit('user_left', { userId: socket.data.user?.id });
    });

    socket.on('disconnect', () => {
      if (!socket.data?.joinedStudios) return;
      for (const studioId of socket.data.joinedStudios) {
        removePresence(studioId, socket.data.user?.id);
        socket.to(studioId).emit('user_left', { userId: socket.data.user?.id });
      }
    });
  });
}
