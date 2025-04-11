const twilio = require("twilio");
const VoiceResponse = twilio.twiml.VoiceResponse;
const client = require("../services/twilioClient");

// Explicit broadcastLog explicitly accepted as parameter here:
module.exports = (app, broadcastLog) => {
  const bankingAssistantController = require("../controllers/bankingAssistantController");

  app.ws("/sockets", (ws) => {
    let callSid = "";
    let userContext = bankingAssistantController.getUserContext();

    const textService = {
      sendText(text, last = true) {
        ws.send(JSON.stringify({ type: "text", token: text, last }));
        broadcastLog("INFO", `Explicitly sent (to UI): ${text}`);
      },
      setLang(language) {
        ws.send(
          JSON.stringify({
            type: "language",
            ttsLanguage: language,
            transcriptionLanguage: language,
          })
        );
        broadcastLog("INFO", `Language explicitly set to: ${language}`);
      },
    };

    ws.on("message", async (data) => {
      const msg = JSON.parse(data);

      broadcastLog(
        "INFO",
        `Message explicitly received: ${JSON.stringify(msg)}`
      );

      switch (msg.type) {
        case "setup":
          callSid = msg.callSid;
          textService.sendText(
            "Hello! How can I assist you with your loan processing needs today?"
          );
          //   broadcastLog(
          //     "INFO",
          //     `Setup explicitly called with callSid: ${callSid}`
          //   );
          break;

        case "prompt":
        case "transcription":
          const inputMsg =
            msg.voicePrompt || msg.text || msg.transcription?.text;
          if (inputMsg) {
            broadcastLog(
              "INFO",
              `Explicit user input explicitly received: ${inputMsg}`
            );

            const promptLower = inputMsg.toLowerCase();
            if (promptLower.includes("french")) {
              textService.setLang("fr-FR");
            } else if (promptLower.includes("spanish")) {
              textService.setLang("es-ES");
            } else {
              const reply = await bankingAssistantController.queryAssistant(
                userContext,
                inputMsg
              );

              broadcastLog(
                "INFO",
                `Assistant reply explicitly provided: ${reply}`
              );

              // Robust and explicit detection clearly for agent transfer intent:
              if (
                reply.toUpperCase().includes("TRANSFER_TO_AGENT") ||
                reply.toLowerCase().includes("connect me to an agent") ||
                reply.toLowerCase().includes("human agent") ||
                reply.toLowerCase().includes("agent transfer")
              ) {
                textService.sendText(
                  "I'm transferring you explicitly to an agent now."
                );

                broadcastLog(
                  "INFO",
                  `Explicit transfer explicitly initiated due to user input: ${inputMsg}`
                );

                // Explicitly invoke agent handoff through REST API:
                const response = await fetch(
                  `http://${process.env.SERVER}/agentHandOff`,
                  {
                    method: "POST",
                    headers: {
                      "Content-type": "application/json",
                    },
                    body: JSON.stringify({ callSid }),
                  }
                );

                const result = await response.json();

                if (result.success) {
                  broadcastLog(
                    "INFO",
                    `Explicit agent handoff succeeded for call SID: ${callSid}`
                  );
                } else {
                  broadcastLog(
                    "ERROR",
                    `Agent handoff failed explicitly: ${result.error}`
                  );
                }
              } else {
                textService.sendText(reply);
              }
            }
          }
          break;

        case "dtmf":
          broadcastLog("INFO", `Explicit DTMF received: ${msg.digit}`);
          break;

        case "interrupt":
          broadcastLog("INFO", "Explicit interrupt received.");
          break;

        case "error":
          broadcastLog(
            "ERROR",
            "Twilio explicitly sent error: " + msg.description
          );
          break;

        default:
          broadcastLog(
            "WARN",
            `Unhandled WS message type explicitly: ${msg.type}`
          );
          break;
      }
    });

    ws.on("close", () => {
      //   broadcastLog("INFO", "WebSocket explicitly closed.");
    });
  });

  app.post("/incoming", (req, res) => {
    const twiml = `
      <Response>
        <Connect>
          <ConversationRelay 
            url="wss://${process.env.SERVER}/sockets"
            dtmfDetection="true"
            voice="en-US-Journey-O"
            transcriptionProvider="google">
            <Language code="en-US" ttsProvider="google"/>
          </ConversationRelay>
        </Connect>
      </Response>`;
    res.type("text/xml").send(twiml.trim());
  });
  app.post("/agentHandOff", async (req, res) => {
    try {
      const callSid = req.body.callSid;

      if (!callSid) {
        const errorMsg = "Explicitly missing callSid in request body.";
        broadcastLog("ERROR", errorMsg);
        return res.status(400).json({ error: errorMsg });
      }

      // explicitly define your human agent's valid phone number clearly:
      const agentNumber = "+13098264420";

      // Explicitly create new Twilio TwiML response explicitly clearly:
      const transferTwiml = new VoiceResponse();
      transferTwiml.say("Connecting you explicitly to a human agent now.");

      // Explicitly add call transcription clearly using Start -> Transcription (Twilio best practices):
      transferTwiml.start().transcription({
        // statusCallback: "https://your-server.com/transcription-callback", // Explicitly replace with your real callback URL explicitly here
        transcriptionEngine: "google", // explicitly select correct transcription engine clearly
        profanityFilter: false,
        intelligenceService: process.env.TWILIO_VOICE_INTELLIGENCE_SERVICE_SID, // explicitly enable or disable profanity filtering explicitly
      });

      // Explicit <Dial> verb, clearly explicitly connecting your specified agent number explicitly:
      transferTwiml
        .dial({
          action: "", // explicitly optional callback URL after call, explicitly add if needed
          record: "record-from-answer", // explicitly record the agent-client conversation clearly
        })
        .number(agentNumber);

      // Update existing Twilio call explicitly, sending corrected TwiML instructions explicitly:
      await client.calls(callSid).update({ twiml: transferTwiml.toString() });

      //   // Explicit logging clearly:
      //   broadcastLog(
      //     "INFO",
      //     `Transferred explicitly to agent; call SID explicitly: ${callSid}`
      //   );
      //   broadcastLog(
      //     "INFO",
      //     `Explicit dial transfer TwiML explicitly sent: ${transferTwiml.toString()}`
      //   );

      // Explicit success response clearly sent:
      res.status(200).json({
        success: true,
        message:
          "Agent transfer explicitly succeeded; recording and live transcription enabled explicitly.",
      });
    } catch (error) {
      const errorMessage =
        "Explicit error transferring call explicitly: " + error.message;
      broadcastLog("ERROR", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  });
};
