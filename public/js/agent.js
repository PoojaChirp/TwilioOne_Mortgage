const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const conversationSocket = new WebSocket(
  `${protocol}://${window.location.host}/sockets`
);
const logSocket = new WebSocket(
  `${protocol}://${window.location.host}/logsockets`
);

// Explicit conversation WebSocket handlers
conversationSocket.onopen = () =>
  logInfo("Conversation WebSocket explicitly connected.");

conversationSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("conversationSocket received explicitly:", data);
  switch (data.type) {
    case "text":
      displayMessage("AI", data.token);
      break;
    case "transcription":
      displayMessage("User (STT)", data.transcription.text);
      break;
    default:
      logError(`Unhandled explicitly type:${data.type}`);
      break;
  }
};

conversationSocket.onerror = (error) =>
  logError(`explicit WebSocket conversation error: ${error.message}`);
conversationSocket.onclose = () =>
  logInfo("Conversation WebSocket explicitly closed.");

// Explicit log WebSocket handlers
logSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("logSocket received explicitly:", data);
  if (data.type === "log") log(data.level, data.message);
};
logSocket.onopen = () => logInfo("Logging socket explicitly connected.");
logSocket.onerror = (error) =>
  logError(`explicit WebSocket logging error: ${error.message}`);
logSocket.onclose = () => logInfo("Logging socket explicitly closed.");

// Explicit Messaging & Logging UI functions
function displayMessage(sender, text) {
  const transcriptionDiv = document.getElementById("transcription");
  if (!transcriptionDiv)
    return logError(
      "Error explicitly: Couldn't find 'transcription' div on the page."
    );

  const messageElement = document.createElement("p");
  messageElement.textContent = `${sender}: ${text}`;
  transcriptionDiv.appendChild(messageElement);
  transcriptionDiv.scrollTop = transcriptionDiv.scrollHeight;
  console.log(`displayMessage explicitly called with: ${sender}: ${text}`);
}

function log(level, msg) {
  console.log(`[${level}] ${msg}`);
  const logEl = document.createElement("div");
  logEl.textContent = `[${new Date().toISOString()}] ${level}: ${msg}`;
  const logsDiv = document.getElementById("logs");
  if (logsDiv) {
    logsDiv.appendChild(logEl);
    logsDiv.scrollTop = logsDiv.scrollHeight;
  } else {
    console.log("Logs div explicitly not found.");
  }
}

function logInfo(message) {
  log("INFO", message);
}
function logError(message) {
  log("ERROR", message);
}

// Explicit outbound call handler
document.getElementById("callButton").onclick = async () => {
  const phone = document.getElementById("phoneNumber").value.trim();
  if (!phone) return logError("Provide valid phone number explicitly.");
  const res = await fetch("/makeCall", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber: phone }),
  });
  const data = await res.json();
  data.success
    ? logInfo("Call initiated explicitly.")
    : logError(`Explicit failure: ${data.message || data.error}`);
};
