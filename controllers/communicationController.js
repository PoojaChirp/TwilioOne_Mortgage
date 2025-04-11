const client = require("../services/twilioClient");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.makeCall = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    await client.calls.create({
      url: `https://${process.env.SERVER}/incoming`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    res.json({ success: true, message: "Call initiated." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendSms = async (req, res) => {
  const { to, body } = req.body;
  try {
    const sms = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    res.json({ success: true, sid: sms.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      text,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
