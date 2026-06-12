import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import { setupSocketHandlers } from './sockets/chatHandler.js';
import { getStorageMode } from './store/collaborationStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE'],
  },
});

// Middleware
app.set('io', io);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(',') || true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    socketReady: true,
    storage: getStorageMode(),
  });
});

// Import routes here
app.use('/api/projects', projectRoutes);
// import userRoutes from './routes/userRoutes.js';
// app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or set a different PORT.`);
  } else {
    console.error(`Server failed to start: ${error.message}`);
  }

  process.exit(1);
});

const db = await connectDB();
app.set('dbConnected', db.connected);
setupSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io ready for real-time connections');
  console.log(`Collaboration storage: ${getStorageMode()}`);
});
