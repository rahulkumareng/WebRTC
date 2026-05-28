import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/Socket";
import "./home.css";

const Home = () => {
  const { socket } = useSocket();
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = ({ roomId }) => {
      navigate(`/room/${roomId}`);
    };

    socket.on("joined-room", handleNavigate);

    return () => {
      socket.off("joined-room", handleNavigate);
    };
  }, [socket, navigate]);

  const handleEnterRoom = () => {
    if (email && roomId) {
      socket.emit("join-room", { emailId: email, roomId });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleEnterRoom();
    }
  };

  return (
    <div className="home-container">
      <h1>WebRTC Video Call</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        type="email"
        placeholder="Enter your email"
      />
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyPress={handleKeyPress}
        type="text"
        placeholder="Enter room ID"
      />
      <button onClick={handleEnterRoom}>Enter Room</button>
    </div>
  );
};

export default Home;
