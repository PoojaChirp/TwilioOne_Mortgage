const client = require("../services/twilioClient");
const sgMail = require("@sendgrid/mail");
const config = require("../config.json");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handleStatusChange = async (req, res) => {
  const { status } = req.body;
  try {
    if (status === "Submitted") {
      await client.messages.create({
        body: "Your claim is submitted.",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: config.User1.phoneNumber,
      });
    } else if (status === "Processing") {
      await sgMail.send({
        to: config.User1.email,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: "Status Processing",
        text: "Claim processing.",
      });
    } else if (status === "Processed") {
      await client.calls.create({
        url: config.twimlUrl,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: config.User1.phoneNumber,
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
