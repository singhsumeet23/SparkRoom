import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // ✅ Check if backend URL exists (e.g., from .env)
    const SOCKET_URL =
      process.env.REACT_APP_SOCKET_URL || window.REACT_APP_SOCKET_URL || "";

    if (!SOCKET_URL) {
      console.warn(
        "⚠️ No backend found — running UI-only mode (no socket connection)."
      );
      setSocket({
        connected: false,
        on: () => {},
        off: () => {},
        emit: () => {},
        disconnect: () => {},
      });
      return;
    }

    // ✅ If URL exists, actually connect
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    return () => {
      if (s) s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
