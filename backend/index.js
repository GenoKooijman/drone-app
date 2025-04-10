const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
}});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("move", (data) => {
    console.log("Move command received:", data);
    io.emit("updateDrone", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

