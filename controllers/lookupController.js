const twilioClient = require("../services/twilioClient");

exports.validatePhoneNumber = async (req, res) => {
  const { phoneNumber, firstName, lastName } = req.body;

  if (!phoneNumber || !firstName || !lastName) {
    return res.status(400).send({
      error: "Phone number, first name, and last name are required",
    });
  }

  try {
    const response = await twilioClient.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({
        fields: "line_type_intelligence,identity_match",
        firstName: firstName,
        lastName: lastName,
      });

    const lineTypeIntelligence =
      response.lineTypeIntelligence.carrier_name || "N/A";
    const deviceType = response.lineTypeIntelligence.type || "N/A";
    const identityMatch = response.identityMatch || {};
    const isMatched =
      identityMatch.first_name_match === "exact_match" &&
      identityMatch.last_name_match === "exact_match";

    res.status(200).send({
      phoneNumber: response.phoneNumber,
      lineTypeIntelligence: lineTypeIntelligence,
      deviceType: deviceType,
      identityMatch: isMatched ? "Matched" : "Not Matched",
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
