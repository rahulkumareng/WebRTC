import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import SocketContextProvider from "./context/Socket.jsx";
import PeerProvider from "./context/Peer.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SocketContextProvider>
      <PeerProvider>
        <App />
      </PeerProvider>
    </SocketContextProvider>
  </BrowserRouter>,
);
