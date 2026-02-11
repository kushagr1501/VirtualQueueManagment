import { useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socketInstance = null;
let connectionCount = 0;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

export const closeSocket = () => {
  connectionCount = Math.max(0, connectionCount - 1);
  if (connectionCount === 0 && socketInstance) {
    socketInstance.close();
    socketInstance = null;
  }
};

export const useSocket = () => {
  const socket = useRef(getSocket());

  useEffect(() => {
    connectionCount++;
    return () => {
      closeSocket();
    };
  }, []);

  const joinPlace = useCallback((placeId) => {
    if (placeId) {
      socket.current.emit("joinPlaceRoom", placeId);
    }
  }, []);

  const leavePlace = useCallback((placeId) => {
    if (placeId) {
      socket.current.emit("leavePlaceRoom", placeId);
    }
  }, []);

  const onQueueUpdate = useCallback((callback) => {
    socket.current.on("queueUpdate", callback);
    return () => {
      socket.current.off("queueUpdate", callback);
    };
  }, []);

  return {
    socket: socket.current,
    joinPlace,
    leavePlace,
    onQueueUpdate,
  };
};

export default useSocket;
