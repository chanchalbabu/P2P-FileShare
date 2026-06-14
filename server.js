const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: '*' },
  maxHttpBufferSize: 1e7
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const rooms = {};

io.on('connection', (socket) => {
  socket.on('create-room', (roomId) => {
    rooms[roomId] = { sender: socket.id };
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log('Room created:', roomId);
  });

  socket.on('join-room', (roomId) => {
    if (!rooms[roomId]) {
      socket.emit('room-not-found');
      return;
    }
    socket.join(roomId);
    rooms[roomId].receiver = socket.id;
    socket.to(roomId).emit('receiver-ready');
    console.log('Receiver joined room:', roomId);
  });

  socket.on('file-info', ({ room, name, size }) => {
    socket.to(room).emit('file-info', { name, size });
  });

  socket.on('file-chunk', ({ room, data, offset }) => {
    socket.to(room).emit('file-chunk', { data, offset });
    socket.emit('chunk-ack', offset);
  });

  socket.on('file-done', ({ room }) => {
    socket.to(room).emit('file-done');
    console.log('Transfer complete in room:', room);
  });

  socket.on('disconnect', () => {
    for (const id in rooms) {
      if (rooms[id].sender === socket.id) {
        socket.to(id).emit('sender-disconnected');
        delete rooms[id];
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});