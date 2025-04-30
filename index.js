const express = require("express");
const http = require("http");

const authRoutes = require("./routes/authroutes");
const adminroutes = require("./routes/adminroutes");
const userroutes = require("./routes/userroutes");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const port = 8004;
const path = require("path");
const { saveMessage } = require("./controllers/chatController");
const groupRoutes      = require("./routes/groupRoutes");
const { saveGroupMessage } = require("./controllers/groupController");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});
const chatRoutes = require("./routes/chatroutes");
const convoroutes=require("./routes/conversationRoutes");
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Use the authentication routes
app.use(authRoutes);
app.use(adminroutes);
app.use(userroutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use(chatRoutes);
app.use(convoroutes);
app.use(groupRoutes);

app.get("/groupchat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "groupChat.html"));
});
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error("Auth error"));
//   try {
//     socket.user = jwt.verify(token, JWT_SECRET);
//     return next();
//   } catch {
//     return next(new Error("Auth error"));
//   }
// });
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("joinGroup", groupId => {
    socket.join(`group_${groupId}`);
  });
  socket.on("joinRoom", (connectionId) => {
    socket.join(connectionId);
    console.log(`Socket ${socket.id} joined room ${connectionId}`);
  });
  socket.on("sendGroupMessage", async data => {
    await saveGroupMessage(data,io);
  });
  socket.on("sendMessage", async (data) => {
    await saveMessage(data);
    io.to(data.connectionId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});
server.listen(port, () => console.log(`Server running on port ${port}`));
