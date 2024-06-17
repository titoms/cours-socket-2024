const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

let socketsConnected = new Set();

io.on('connection', (socket) => {
  console.log(`New client connected : ${socket.id}`);
  socketsConnected.add(socket.id);

  // Emit the total number of clients to all connected clients
  io.emit('clientsTotal', socketsConnected.size);

  // Handle incoming messages
  socket.on('message', (message) => {
    io.emit('message', message);
  });

  // Handle typing feedback
  socket.on('typing', (feedback) => {
    socket.broadcast.emit('typing', feedback);
  });

  // Handle stop typing event
  socket.on('stopTyping', () => {
    socket.broadcast.emit('typing', '');
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected : ${socket.id}`);
    socketsConnected.delete(socket.id);
    io.emit('clientsTotal', socketsConnected.size);
  });
});

server.listen(PORT, () => console.log(`Server online on port ${PORT}`));
