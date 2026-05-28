import { useMemo, useContext, createContext, useEffect } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const SocketContextProvider = ({ children }) => {
  const socket = useMemo(() => {
    return io(SOCKET_URL);
  }, []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SocketContextProvider;
