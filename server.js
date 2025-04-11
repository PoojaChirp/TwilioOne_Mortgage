const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const logClients = [];

dotenv.config();

const app = express();
expressWs(app);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/communicationRoutes"));
app.use("/", require("./routes/lookupRoutes"));
app.use("/", require("./routes/signupRoutes"));
app.use("/", require("./routes/statusRoutes"));
app.use("/", require("./routes/videoRoutes"));
app.use("/", require("./routes/authRoutes"));
// Now explicitly pass broadcastLog here to your route handler:
require("./routes/bankingAssistantRoutes")(app, broadcastLog);

app.ws("/logsockets", (ws) => {
  logClients.push(ws);

  ws.on("close", () => {
    const idx = logClients.indexOf(ws);
    if (idx > -1) logClients.splice(idx, 1);
  });
});

// Explicitly defined helper to broadcast log messages
function broadcastLog(level, message) {
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({ type: "log", level, timestamp, message });
  logClients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
  // Also console log explicitly
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// Finally, explicitly run your server:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running explicitly on port ${PORT}`);
  broadcastLog("INFO", `Server running explicitly on port ${PORT}`);
});

// Explicitly export (optional, for clarity or reusability)
module.exports = { broadcastLog };
