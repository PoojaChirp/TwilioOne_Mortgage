const express = require("express");
const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

//const Analytics = require('analytics-node');
const fs = require("fs");

// Import the required classes from Twilio
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Load configuration file
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Your ngrok URL
//const ngrokUrl = "https://85e21ed4057d.ngrok.app";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//const analytics = new Analytics(process.env.SEGMENT_WRITE_KEY);

// Middleware to parse JSON
app.use(express.json());
app.use(express.static("public"));

// Verify API
app.post("/verify", async (req, res) => {
  const { to, channel } = req.body;
  try {
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to, channel });
    res.status(200).json({ success: true, sid: verification.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify Check API
app.post("/verify/check", async (req, res) => {
  const { to, code } = req.body;
  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code });
    res.status(200).json({ success: true, status: verificationCheck.status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send SMS API
app.post("/sms", (req, res) => {
  const { to, body } = req.body;
  twilioClient.messages
    .create({ body, from: process.env.TWILIO_PHONE_NUMBER, to })
    .then((message) =>
      res.status(200).json({ success: true, sid: message.sid })
    )
    .catch((error) =>
      res.status(500).json({ success: false, error: error.message })
    );
});

// Send Email API
app.post("/email", (req, res) => {
  const { to, subject, text } = req.body;
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject,
    text,
  };
  sgMail
    .send(msg)
    .then(() => res.status(200).json({ success: true }))
    .catch((error) =>
      res.status(500).json({ success: false, error: error.message })
    );
});

// Voice Call API
app.post("/call", (req, res) => {
  const { to, url } = req.body;
  twilioClient.calls
    .create({ url, to, from: process.env.TWILIO_PHONE_NUMBER })
    .then((call) => res.status(200).json({ success: true, sid: call.sid }))
    .catch((error) =>
      res.status(500).json({ success: false, error: error.message })
    );
});

// // Segment Track API
// app.post("/segment/track", (req, res) => {
//   const { userId, event, properties } = req.body;
//   analytics.track({ userId, event, properties }, (err) => {
//     if (err) {
//       res.status(500).json({ success: false, error: err.message });
//     } else {
//       res.status(200).json({ success: true });
//     }
//   });
// });

//Lookup API for Identity match and line type intelligence
app.post("/validate", async (req, res) => {
  const { phoneNumber, firstName, lastName } = req.body;

  if (!phoneNumber || !firstName || !lastName) {
    return res
      .status(400)
      .send({ error: "Phone number, first name, and last name are required" });
  }

  const lookup = await twilioClient.lookups.v2
    .phoneNumbers(phoneNumber)
    .fetch({
      fields: "line_type_intelligence,identity_match",
      firstName: firstName,
      lastName: lastName,
    })
    .then((response) => {
      console.log(response);
      const lineTypeIntelligence =
        response.lineTypeIntelligence.carrier_name || "N/A";
      const deviceType = response.lineTypeIntelligence.type || "N/A";
      const identityMatch = response.identityMatch || {};
      const isMatched =
        identityMatch.first_name_match === "exact_match" &&
        identityMatch.last_name_match === "exact_match";

      res.send({
        phoneNumber: response.phoneNumber,
        lineTypeIntelligence: lineTypeIntelligence,
        deviceType: deviceType,
        identityMatch: isMatched ? "Matched" : "Not Matched",
      });
    })
    .catch((error) => {
      res.status(500).send({ error: error.message });
    });
});

app.post("/signup", async (req, res) => {
  const { phoneNumber, email } = req.body;

  try {
    // Validate the phone number using Twilio Lookup API
    const phoneLookup = await twilioClient.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ type: ["carrier"] });

    // Send SMS verification
    const verificationSMS = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    // Send email verification
    const verificationEmail = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: email,
        channel: "email",
      });

    // Respond with success
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error during signup process:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Route to handle status change
app.post("/handle-status", (req, res) => {
  const { status, phoneNumber, emailAddress } = req.body;

  switch (status) {
    case "Submitted":
      // Send SMS
      twilioClient.messages
        .create({
          body: "Your claim status is now 'Submitted'.",
          from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
          to: config.User1.phoneNumber,
        })
        .then((message) => console.log(`SMS sent: ${message.sid}`))
        .catch((error) => console.error(error));
      break;

    case "Processing":
      // Send Email
      const msg = {
        to: config.User1.email,
        from: process.env.SENDGRID_SENDER_EMAIL, // Verified sender
        subject: "Healthcare & Life Sciences - Status Update: Processing",
        text: "Your claim status is now 'Processing'.",
        html: "<strong>Your claim status is now 'Processing'.</strong>",
      };
      sgMail
        .send(msg)
        .then(() => console.log("Email sent"))
        .catch((error) => console.error(error));
      break;

    case "Processed":
      // Make a Phone Call
      twilioClient.calls
        .create({
          url: "https://handler.twilio.com/twiml/EH69b80f30e5f8ec29d9cd8c1223ff64ff", // Replace with your TwiML Bin URL
          to: config.User1.phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        })
        .then((call) => console.log(`Call initiated: ${call.sid}`))
        .catch((error) => console.error(error));
      break;

    default:
      console.log("Unknown status");
  }

  res.send("Status handled");
});

//Call Video API
app.get("/token", (req, res) => {
  const { identity } = req.query;

  if (!identity) {
    return res.status(400).send("Identity is required");
  }

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );

  const videoGrant = new VideoGrant({
    room: "my-video-room", // Specify a room name
  });
  token.addGrant(videoGrant);

  res.send({ token: token.toJwt() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
