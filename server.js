const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");

const https = require("https");
const fs = require("fs");

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

  console.log(message)

  // ส่งข้อความไปยัง WebSocket Clients
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.status(200).send({ status: "Message sent to WebSocket clients" });
});

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/evxcars.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/evxcars.com/fullchain.pem"),
};

const server = https.createServer(options, app);

// เปิด HTTP Server สำหรับ WebSocket
server.listen(8080, () => {
  console.log("WebSocket server running on https://your-domain.com:8080");
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
