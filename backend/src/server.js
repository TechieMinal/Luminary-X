require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes    = require('./routes/authRoutes');
const mentorRoutes  = require('./routes/mentorRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes   = require('./routes/skillRoutes');
const messageRoutes = require('./routes/messageRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const adminRoutes   = require('./routes/adminRoutes');

const app    = express();
const httpServer = createServer(app);

connectDB();

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

app.use('/api/', apiLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'healthy', uptime: Math.floor(process.uptime()), env: process.env.NODE_ENV },
    message: 'Luminary X API is running',
    error: null,
  });
});

app.use('/api/auth',     authRoutes);
app.use('/api/mentors',  mentorRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills',   skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin',    adminRoutes);

app.use(notFound);
app.use(errorHandler);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Track online users: userId → socketId
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  // Broadcast this user is online
  io.emit('user:online', { userId });

  // Send current online users list to the newly connected client
  socket.emit('users:online', Array.from(onlineUsers.keys()));

  // Join a personal room for direct messages
  socket.join(`user:${userId}`);

  // Handle sending a message via socket
  socket.on('message:send', async (payload) => {
    const { receiverId, content, tempId } = payload;
    if (!receiverId || !content?.trim()) return;

    try {
      const Message = require('./models/Message');
      const User    = require('./models/User');

      const receiver = await User.findById(receiverId);
      if (!receiver || !receiver.isActive) return;

      const message = await Message.create({
        sender:   userId,
        receiver: receiverId,
        content:  content.trim(),
      });

      const populated = await Message.findById(message._id)
        .populate('sender',   'name avatar')
        .populate('receiver', 'name avatar');

      // Deliver to receiver's room
      io.to(`user:${receiverId}`).emit('message:receive', populated);

      // Confirm to sender (replace tempId with real message)
      socket.emit('message:sent', { tempId, message: populated });

      // Update unread count for receiver
      const unreadCount = await Message.countDocuments({ receiver: receiverId, read: false });
      io.to(`user:${receiverId}`).emit('unread:update', { count: unreadCount });
    } catch (err) {
      socket.emit('message:error', { tempId, error: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('messages:read', async ({ conversationId }) => {
    if (!conversationId) return;
    try {
      const Message = require('./models/Message');
      await Message.updateMany(
        { conversationId, receiver: userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
      const unreadCount = await Message.countDocuments({ receiver: userId, read: false });
      socket.emit('unread:update', { count: unreadCount });
    } catch {}
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('user:offline', { userId });
  });
});

// Expose io for use in controllers if needed
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () => {
  logger.info(`Luminary X running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM — shutting down');
  server.close(() => process.exit(0));
});

module.exports = app;
