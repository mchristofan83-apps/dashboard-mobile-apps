
// Real-time Socket.IO Handlers
const jwt = require('jsonwebtoken');

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
  }

  handleConnection(socket) {
    console.log(`🔗 User connected: ${socket.id}`);

    // Authenticate socket
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        this.connectedUsers.set(socket.userId, socket);
        
        socket.emit('authenticated', { success: true });
        console.log(`✅ User authenticated: ${socket.username}`);
        
        // Join user-specific room
        socket.join(`user-${socket.userId}`);
        
        // Join role-based room
        if (decoded.access_level === 'admin') {
          socket.join('admin');
        }
        
      } catch (error) {
        socket.emit('authenticated', { success: false, error: 'Invalid token' });
        socket.disconnect();
      }
    });

    // Handle real-time events
    socket.on('data:update', (data) => {
      this.broadcastDataUpdate(data);
    });

    socket.on('visit:update', (data) => {
      this.broadcastVisitUpdate(data);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        this.connectedUsers.delete(socket.userId);
        console.log(`🔌 User disconnected: ${socket.username}`);
      }
    });
  }

  broadcastDataUpdate(data) {
    this.io.emit('data:updated', data);
  }

  broadcastVisitUpdate(data) {
    this.io.emit('visit:updated', data);
  }

  broadcastToAdmins(event, data) {
    this.io.to('admin').emit(event, data);
  }

  broadcastToUser(userId, event, data) {
    this.io.to(`user-${userId}`).emit(event, data);
  }
}

module.exports = SocketHandlers;
