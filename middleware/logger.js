// middleware/logger.js
require("colors");

const logs = [];

const addLog = (level, message) => {
  const timestamp = new Date().toISOString();
  logs.push({ timestamp, level, message });
  console.log(`${timestamp} [${level}]: ${message}`.cyan);
};

const getLogs = () => logs;

module.exports = { addLog, getLogs };
