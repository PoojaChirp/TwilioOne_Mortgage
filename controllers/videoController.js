const {
  jwt: { AccessToken },
} = require("twilio");

exports.getVideoToken = (req, res) => {
  const { identity } = req.query;
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );
  token.addGrant(new AccessToken.VideoGrant({ room: "my-video-room" }));
  res.json({ token: token.toJwt() });
};
