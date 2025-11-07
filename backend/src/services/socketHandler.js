const Document = require('../models/document.model');

const activeLocks = new Map();
const usersInRooms = {};

function releaseAllLocksForSocket(socketId) {
  const released = [];
  for (const [elementId, ownerSocketId] of activeLocks.entries()) {
    if (ownerSocketId === socketId) {
      activeLocks.delete(elementId);
      released.push(elementId);
    }
  }
  return released;
}

function handleSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // --- JOIN ROOM (Unchanged) ---
    socket.on('join-room', ({ documentId, user }) => {
      socket.join(documentId);
      socket.data.room = documentId;
      socket.data.user = user;

      if (!usersInRooms[documentId]) usersInRooms[documentId] = [];

      const existing = usersInRooms[documentId].find(u => u.id === socket.id);
      if (!existing) {
        const userWithSocket = { ...user, id: socket.id };
        usersInRooms[documentId].push(userWithSocket);
        socket.emit('existing-users', usersInRooms[documentId]);
        socket.to(documentId).emit('user-joined', userWithSocket);
      }

      // Send active locks
      const locks = {};
      for (const [elementId, ownerSocketId] of activeLocks.entries()) {
        const ownerInfo = usersInRooms[documentId]?.find(u => u.id === ownerSocketId);
        if (ownerInfo) {
          locks[elementId] = {
            userId: ownerSocketId,
            userName: ownerInfo.name
          };
        }
      }
      socket.emit('current-locks', locks);
    });

    // --- CURSOR MOVEMENT (Unchanged) ---
    socket.on('cursor-move', (position) => {
      const { room, user } = socket.data;
      if (room && user) {
        socket.to(room).emit('cursor-update', {
          userId: socket.id,
          name: user.name,
          position,
        });
      }
    });

    // --- CREATE ELEMENT (Unchanged) ---
    socket.on('create-element', async (element) => {
      const { room } = socket.data;
      if (!room) return;
      try {
        await Document.findByIdAndUpdate(room, { $push: { elements: element } });
        io.in(room).emit('element-created', element);
      } catch (err) {
        console.error('❌ create-element:', err);
      }
    });

    // --- REQUEST LOCK (Unchanged) ---
    socket.on('request-lock', ({ elementId }) => {
      const { room } = socket.data;
      if (!room) return;

      const currentLock = activeLocks.get(elementId);
      const userList = usersInRooms[room] || [];
      const lockerInfo = userList.find(u => u.id === socket.id);

      if (!currentLock) {
        activeLocks.set(elementId, socket.id);
        io.in(room).emit('lock-acquired', {
          elementId,
          userId: socket.id,
          userName: lockerInfo ? lockerInfo.name : 'Unknown User',
        });
      } else {
        const owner = userList.find(u => u.id === currentLock);
        socket.emit('lock-failed', {
          elementId,
          lockedBy: currentLock,
          lockedByName: owner ? owner.name : 'Unknown User',
        });
      }
    });

    // --- UPDATE ELEMENT (Unchanged) ---
    socket.on('update-element', async ({ elementId, changes }) => {
      const { room } = socket.data;
      if (!room) return;

      const owner = activeLocks.get(elementId);
      if (owner && owner !== socket.id) return; // respect lock

      try {
        const updateQuery = {};
        for (const key in changes) {
          updateQuery[`elements.$.${key}`] = changes[key];
        }
        await Document.updateOne(
          { _id: room, 'elements.id': elementId },
          { $set: updateQuery }
        );
        socket.to(room).emit('element-updated', { elementId, changes });
      } catch (err) {
        console.error('❌ update-element:', err);
      }
    });

    // --- DELETE ELEMENT (Unchanged) ---
    socket.on('delete-element', async ({ elementId }) => {
      const { room } = socket.data;
      if (!room) return;

      const owner = activeLocks.get(elementId);
      if (owner && owner !== socket.id) return;

      try {
        await Document.updateOne(
          { _id: room },
          { $pull: { elements: { id: elementId } } }
        );
        activeLocks.delete(elementId);
        socket.to(room).emit('element-deleted', { elementId });
      } catch (err) {
        console.error('❌ delete-element:', err);
      }
    });

    // --- RELEASE LOCK (Unchanged) ---
    socket.on('release-lock', ({ elementId }) => {
      const { room } = socket.data;
      if (!room) return;
      if (activeLocks.get(elementId) === socket.id) {
        activeLocks.delete(elementId);
        socket.to(room).emit('lock-released', { elementId });
      }
    });

    // --- 💬 UPDATED CHAT SYSTEM ---
    // Replaced 'chat:send' with 'send_message' to match useRoom.js
    // Replaced 'chat:message' with 'receive_message' to match useRoom.js
    socket.on('send_message', (messageData) => {
      // messageData is { documentId, content, userName, timestamp, id }
      if (!messageData || !messageData.documentId) return;

      // Broadcast to everyone in that room
      io.to(messageData.documentId).emit('receive_message', messageData);
    });

    // --- DISCONNECT CLEANUP (Unchanged) ---
    socket.on('disconnect', () => {
      const { room, user } = socket.data;
      console.log(`❌ Disconnected: ${socket.id}`);

      if (room && user && usersInRooms[room]) {
        usersInRooms[room] = usersInRooms[room].filter(u => u.id !== socket.id);
        socket.to(room).emit('user-left', socket.id);
      }

      const released = releaseAllLocksForSocket(socket.id);
      if (released.length && room) {
        released.forEach(elId => io.in(room).emit('lock-released', { elementId: elId }));
      }
    });
  });
}

module.exports = handleSocket;