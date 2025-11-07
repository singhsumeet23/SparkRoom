require('dotenv').config();
console.log("JWT SECRET CHECK:", process.env.JWT_SECRET);
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/utils/db');
const userRoutes = require('./src/routes/user.routes.js');
// Import models and routes
require('./src/models/user.model');
require('./src/models/document.model');
const authRoutes = require('./src/routes/auth.routes');
const documentRoutes = require('./src/routes/document.routes');
const handleSocket = require('./src/services/socketHandler');

// --- 1. Initialize Server ---
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// --- 2. Connect to Database ---
connectDB();

// --- 3. Middleware ---
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// --- 4. Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
handleSocket(io);

// --- 5. API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/auth', require('./src/routes/auth.routes')); 
app.use('/api/documents', require('./src/routes/document.routes'));
// NEW ROUTE
app.use('/api/users', userRoutes);
app.use('/api/ai', require('./src/routes/ai.routes.js'))
app.use('/api/contact', require('./src/routes/contact.routes.js'));
// --- 6. Root Test Route ---
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// --- 7. Start Server ---
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
