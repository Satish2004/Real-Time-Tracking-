const express = require("express");
const app = express();
const path = require("path");

// SERVER FOR SOCKET.IO
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// Set view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle Socket.IO connections
io.on("connection", function (socket) {
  socket.on("send-location", function (data) {
    io.emit("receive-location", { id: socket.id, ...data });
  });
  // when user disconnected then show user-disconnected-->
  socket.on("disconnect", function () {
    io.emit("user-disconnected", socket.id);
  });
});

// Route to render the EJS template
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
