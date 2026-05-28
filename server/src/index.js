const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174"];

const io = new Server(PORT, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

const emailToSocketMapping = new Map();
const socketIdToEmail = new Map();
const socketToRoom = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { emailId, roomId } = data;

    emailToSocketMapping.set(emailId, socket.id);
    socketIdToEmail.set(socket.id, emailId);
    socketToRoom.set(socket.id, roomId);

    const existingUsers = Array.from(
      io.sockets.adapter.rooms.get(roomId) || []
    )
      .map((socketId) => socketIdToEmail.get(socketId))
      .filter(Boolean);

    socket.join(roomId);
    socket.emit("joined-room", { roomId });

    if (existingUsers.length > 0) {
      socket.emit("user-joined", { emailId: existingUsers[0] });
    }

    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });

  socket.on("call-user", ({ emailId, offer }) => {
    const fromEmail = socketIdToEmail.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    io.to(socketId).emit("incomming-call", { from: fromEmail, offer });
  });

  socket.on("call-accepted", ({ emailId, answer }) => {
    const socketId = emailToSocketMapping.get(emailId);
    io.to(socketId).emit("call-accepted", { answer });
  });

  socket.on("disconnect", () => {
    const emailId = socketIdToEmail.get(socket.id);
    const roomId = socketToRoom.get(socket.id);

    if (emailId) {
      emailToSocketMapping.delete(emailId);
    }
    socketIdToEmail.delete(socket.id);
    socketToRoom.delete(socket.id);

    if (roomId) {
      socket.broadcast.to(roomId).emit("user-left", { emailId });
    }
  });
});

console.log(`Server running on port ${PORT}`);
