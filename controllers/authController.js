const client = require("../services/twilioClient");

exports.verify = async (req, res) => {
  const { to, channel } = req.body;
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to, channel });
    res.json({ success: true, sid: verification.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyCheck = async (req, res) => {
  const { to, code } = req.body;
  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code });
    res.json({ success: true, status: verificationCheck.status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
