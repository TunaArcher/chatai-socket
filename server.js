const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const wss = new WebSocket.Server({ noServer: true });
let clients = [];

// WebSocket Server
wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
  });
});

// รับข้อความจาก Webhook
app.post("/", (req, res) => {
  const message = req.body;

  // ส่งข้อความไปยัง WebSocket Clients
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.status(200).send({ status: "Message sent to WebSocket clients" });
});

// เปิด HTTP Server สำหรับ WebSocket
const server = app.listen(8080, () => {
  console.log("WebSocket server running on http://localhost:8080");
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
