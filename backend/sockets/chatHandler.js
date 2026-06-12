import { addMessage, getMessages } from '../store/collaborationStore.js';

const roomUsers = new Map();

const getRoomUsers = (projectId) => Array.from(roomUsers.get(projectId)?.values() || []);

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a project room
    socket.on('join-project', (projectId, username) => {
      if (!projectId) return;

      socket.join(`project-${projectId}`);
      socket.data.projectId = projectId;
      socket.data.username = username || 'Anonymous';

      if (!roomUsers.has(projectId)) {
        roomUsers.set(projectId, new Map());
      }

      roomUsers.get(projectId).set(socket.id, socket.data.username);
      
      console.log(`${socket.data.username} joined project ${projectId}`);
      
      // Notify others in the room
      socket.to(`project-${projectId}`).emit('user-joined', {
        username: socket.data.username,
        message: `${socket.data.username} joined the project`,
      });

      io.to(`project-${projectId}`).emit('project-users', getRoomUsers(projectId));
    });

    // Handle incoming messages
    socket.on('send-message', async (data) => {
      const { projectId, text, username } = data;
      
      if (!projectId || !text?.trim()) return;

      try {
        const message = await addMessage({
          projectId,
          username: username || socket.data.username,
          text: text.trim(),
        });

        // Broadcast to all users in the project room
        io.to(`project-${projectId}`).emit('receive-message', message);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Get chat history for a project
    socket.on('get-chat-history', async (projectId) => {
      if (!projectId) return;

      try {
        socket.emit('chat-history', await getMessages(projectId));
      } catch (error) {
        console.error('Error fetching chat history:', error);
        socket.emit('error', { message: 'Failed to fetch chat history' });
      }
    });

    // Leave project
    socket.on('leave-project', (projectId) => {
      if (!projectId) return;

      socket.leave(`project-${projectId}`);
      roomUsers.get(projectId)?.delete(socket.id);

      if (roomUsers.get(projectId)?.size === 0) {
        roomUsers.delete(projectId);
      }

      socket.to(`project-${projectId}`).emit('user-left', {
        username: socket.data.username,
        message: `${socket.data.username} left the project`,
      });
      io.to(`project-${projectId}`).emit('project-users', getRoomUsers(projectId));
      console.log(`${socket.data.username} left project ${projectId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.data.projectId) {
        roomUsers.get(socket.data.projectId)?.delete(socket.id);

        if (roomUsers.get(socket.data.projectId)?.size === 0) {
          roomUsers.delete(socket.data.projectId);
        }

        socket.to(`project-${socket.data.projectId}`).emit('user-left', {
          username: socket.data.username,
          message: `${socket.data.username} disconnected`,
        });
        io.to(`project-${socket.data.projectId}`).emit('project-users', getRoomUsers(socket.data.projectId));
      }
    });
  });
};
