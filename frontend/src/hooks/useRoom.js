import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import throttle from 'lodash.throttle';

export const useRoom = () => {
  const socket = useSocket();
  const { documentId } = useParams();
  const { token, myUser } = useAuth(); // 'myUser' is what we need

  // --- State ---
  const [elements, setElements] = useState({});
  const [locks, setLocks] = useState({});
  const [users, setUsers] = useState({});
  const [cursors, setCursors] = useState({});
  const [messages, setMessages] = useState([]); // <-- 1. ADD MESSAGES STATE
  const mySocketId = socket?.id;

  // ---------- 1) Fetch initial document (Unchanged) ----------
  useEffect(() => {
    const fetchDocument = async () => {
      if (!token) return; 
      try {
        const res = await fetch(`http://localhost:3001/api/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error('useRoom: Fetch failed', data.message);
          return;
        }
        const map = {};
        if (Array.isArray(data.elements)) {
          data.elements.forEach((el) => (map[el.id] = el));
        }
        setElements(map);
      } catch (err) {
        console.error('useRoom: fetchDocument error', err);
      }
    };
    fetchDocument();
  }, [documentId, token]);


  // ---------- 2) Connect, Join, and Set up ALL Listeners ----------
  useEffect(() => {
    if (!socket || !documentId || !myUser) return;

    // --- Define ALL Handlers ---
    const handleElementCreated = (element) => setElements((prev) => ({ ...prev, [element.id]: element }));
    const handleElementUpdated = ({ elementId, changes }) => setElements((prev) => ({ ...prev, [elementId]: { ...(prev[elementId] || {}), ...changes } }));
    const handleElementDeleted = ({ elementId }) => setElements((prev) => { const c = { ...prev }; delete c[elementId]; return c; });
    const handleLockAcquired = ({ elementId, userId, userName }) => setLocks((prev) => ({ ...prev, [elementId]: { userId, userName } }));
    const handleLockReleased = ({ elementId }) => setLocks((prev) => { const c = { ...prev }; delete c[elementId]; return c; });
    const handleLockFailed = (payload) => console.warn('[useRoom] lock-failed', payload);
    const handleCurrentLocks = (roomLocks) => setLocks(roomLocks || {});
    const handleExistingUsers = (existingUsers) => {
      const usersMap = {};
      existingUsers.forEach((user) => { usersMap[user.id] = user; });
      setUsers(usersMap);
    };
    const handleUserJoined = (user) => setUsers((prev) => ({ ...prev, [user.id]: user }));
    const handleUserLeft = (userId) => {
      setUsers((prev) => { const c = { ...prev }; delete c[userId]; return c; });
      setCursors((prev) => { const c = { ...prev }; delete c[userId]; return c; }); 
    };
    const handleCursorUpdate = (data) => setCursors((prev) => ({ ...prev, [data.userId]: { position: data.position, name: data.name } }));

    // --- 2. ADD CHAT HANDLER ---
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    // --- Setup Function (Attaches all listeners) ---
    const onConnect = () => {
        console.debug("[useRoom] Socket connected, attaching listeners and joining room...");
        socket.emit('join-room', { documentId, user: myUser });
        
        socket.on('element-created', handleElementCreated);
        socket.on('element-updated', handleElementUpdated);
        socket.on('element-deleted', handleElementDeleted);
        socket.on('lock-acquired', handleLockAcquired);
        socket.on('lock-released', handleLockReleased);
        socket.on('lock-failed', handleLockFailed);
        socket.on('current-locks', handleCurrentLocks);
        socket.on('existing-users', handleExistingUsers);
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on('cursor-update', handleCursorUpdate);

        // --- 3. ATTACH CHAT LISTENER ---
        socket.on('receive_message', handleReceiveMessage);
    };

    // --- Cleanup Function (Removes all listeners) ---
    const onDisconnect = () => {
        console.debug("[useRoom] Socket disconnected, cleaning up listeners...");
        socket.off('element-created', handleElementCreated);
        socket.off('element-updated', handleElementUpdated);
        socket.off('element-deleted', handleElementDeleted);
        socket.off('lock-acquired', handleLockAcquired);
        socket.off('lock-released', handleLockReleased);
        socket.off('lock-failed', handleLockFailed);
        socket.off('current-locks', handleCurrentLocks);
        socket.off('existing-users', handleExistingUsers);
        socket.off('user-joined', handleUserJoined);
        socket.off('user-left', handleUserLeft);
        socket.off('cursor-update', handleCursorUpdate);

        // --- 4. CLEAN UP CHAT LISTENER ---
        socket.off('receive_message', handleReceiveMessage);
    };

    // --- Connect, Listen, and Disconnect (Unchanged) ---
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.connect(); 

    return () => {
      console.debug("[useRoom] Unmounting, disconnecting socket.");
      onDisconnect(); 
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [socket, documentId, myUser]); // myUser is a dependency

  // --- Emitter functions (Unchanged) ---
  const createElement = useCallback((element) => {
    setElements((prev) => ({ ...prev, [element.id]: element }));
    socket.emit('create-element', element);
  }, [socket]);

  const updateElement = useCallback((elementId, changes) => {
    setElements((prev) => ({ ...prev, [elementId]: { ...prev[elementId], ...changes } }));
    socket.emit('update-element', { elementId, changes });
  }, [socket]);

  const deleteElement = useCallback((elementId) => {
    setElements((prev) => { const c = { ...prev }; delete c[elementId]; return c; });
    socket.emit('delete-element', { elementId });
  }, [socket]);

  const requestLock = useCallback((elementId) => {
    socket.emit('request-lock', { elementId });
  }, [socket]);

  const releaseLock = useCallback((elementId) => {
    socket.emit('release-lock', { elementId });
  }, [socket]);


  // --- 5. ADD SEND MESSAGE EMITTER ---
  const sendMessage = useCallback((content) => {
    if (socket && content.trim() && myUser) {
      const messageData = {
        documentId,
        content,
        userName: myUser.name, // Send the user's name
        timestamp: Date.now(),
        id: `msg-${Date.now()}`, // Simple unique ID
      };
      // Emit to server
      socket.emit("send_message", messageData);
    }
  }, [socket, documentId, myUser]);


  // --- Emitter for Cursors (Unchanged) ---
  const sendCursorPosition = useMemo(
    () =>
      throttle((position) => {
        socket.emit('cursor-move', position);
      }, 30),
    [socket]
  );

  useEffect(() => {
    const handleMouseMove = (e) => sendCursorPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      sendCursorPosition.cancel();
    };
  }, [sendCursorPosition]);
  
  // --- Return API ---
  return {
    documentId, 
    elements: Object.values(elements), // Your logic
    locks,
    users: Object.values(users),
    cursors: Object.values(cursors),
    mySocketId,
    createElement,
    updateElement,
    deleteElement,
    requestLock,
    releaseLock,
    // --- 6. EXPORT MESSAGES AND SENDER ---
    messages,
    sendMessage,
  };
};