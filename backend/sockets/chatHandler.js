import { Message } from '../models/Message.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a project room
    socket.on('join-project', (projectId, username) => {
      socket.join(`project-${projectId}`);
      socket.projectId = projectId;
      socket.username = username || 'Anonymous';
      
      console.log(`${socket.username} joined project ${projectId}`);
      
      // Notify others in the room
      socket.to(`project-${projectId}`).emit('user-joined', {
        username: socket.username,
        message: `${socket.username} joined the chat`,
      });
    });

    // Handle incoming messages
    socket.on('send-message', async (data) => {
      const { projectId, text, username } = data;
      
      if (!text.trim()) return;

      try {
        // Save message to MongoDB
        const message = new Message({
          projectId,
          username: username || socket.username,
          text,
          timestamp: new Date(),
        });

        await message.save();

        // Broadcast to all users in the project room
        io.to(`project-${projectId}`).emit('receive-message', {
          id: message._id,
          projectId,
          username: message.username,
          text: message.text,
          timestamp: message.timestamp,
        });
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Get chat history for a project
    socket.on('get-chat-history', async (projectId) => {
      try {
        const messages = await Message.find({ projectId })
          .sort({ timestamp: 1 })
          .limit(100);

        socket.emit('chat-history', messages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        socket.emit('error', { message: 'Failed to fetch chat history' });
      }
    });

    // Leave project
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      socket.to(`project-${projectId}`).emit('user-left', {
        username: socket.username,
        message: `${socket.username} left the chat`,
      });
      console.log(`${socket.username} left project ${projectId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.projectId) {
        socket.to(`project-${socket.projectId}`).emit('user-left', {
          username: socket.username,
          message: `${socket.username} disconnected`,
        });
      }
    });
  });
};
