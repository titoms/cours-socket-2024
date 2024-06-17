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
let users = {};

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  socketsConnected.add(socket.id);

  socket.on('setUsername', (username) => {
    users[socket.id] = username;
    io.emit('updateUserList', users);
  });

  io.emit('clientsTotal', socketsConnected.size);

  // Handle incoming messages
  socket.on('message', (message) => {
    const messageWithDirection = {
      ...message,
      direction: 'messageRight', // The sender's message will always be 'messageRight'
    };
    io.emit('message', messageWithDirection);
  });

  // Handle private messages
  socket.on('privateMessage', ({ recipientId, message }) => {
    const privateMessage = {
      text: message,
      author: users[socket.id],
      date: new Date().toLocaleString(),
      senderId: socket.id,
      recipientId: recipientId,
      direction: 'messageRight', // The sender's message will always be 'messageRight'
    };
    // Send to recipient
    io.to(recipientId).emit('privateMessage', privateMessage);
    // Echo the message back to the sender with 'messageRight' direction
    socket.emit('privateMessage', privateMessage);
  });

  // Handle typing feedback
  socket.on('typing', ({ recipientId, feedback }) => {
    if (recipientId === 'All') {
      socket.broadcast.emit('typing', { recipientId, feedback });
    } else {
      socket.to(recipientId).emit('typing', { recipientId, feedback });
    }
  });

  // Handle stop typing event
  socket.on('stopTyping', (recipientId) => {
    if (recipientId === 'All') {
      socket.broadcast.emit('typing', { recipientId, feedback: '' });
    } else {
      socket.to(recipientId).emit('typing', { recipientId, feedback: '' });
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    socketsConnected.delete(socket.id);
    delete users[socket.id];
    io.emit('updateUserList', users);
    io.emit('clientsTotal', socketsConnected.size);
  });
});

server.listen(PORT, () => console.log(`Server online on port ${PORT}`));
