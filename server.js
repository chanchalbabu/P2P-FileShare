/**
 * server.js
 * P2P Web Share - Signaling Server
 * Handles WebRTC signaling only - no file data passes through this server
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Store room information
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create or join a room
  socket.on('create-room', (roomId) => {
    rooms[roomId] = { sender: socket.id, receiver: null };
    socket.join(roomId);
    console.log('Room created:', roomId);
  });

  // Receiver joins room
  socket.on('join-room', (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].receiver = socket.id;
      socket.join(roomId);
      // Notify sender that receiver joined
      socket.to(roomId).emit('receiver-joined');
      console.log('Receiver joined room:', roomId);
    } else {
      socket.emit('room-not-found');
    }
  });

  // WebRTC signaling - offer
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', offer);
  });

  // WebRTC signaling - answer
  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', answer);
  });

  // WebRTC signaling - ICE candidates
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  // File metadata (not the file itself!)
  socket.on('file-info', ({ roomId, fileInfo }) => {
    socket.to(roomId).emit('file-info', fileInfo);
  });

  // Transfer complete notification
  socket.on('transfer-complete', (roomId) => {
    socket.to(roomId).emit('transfer-complete');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify other user in room
    for (const roomId in rooms) {
      if (rooms[roomId].sender === socket.id || rooms[roomId].receiver === socket.id) {
        socket.to(roomId).emit('peer-disconnected');
        delete rooms[roomId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});