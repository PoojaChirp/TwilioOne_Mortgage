const router = require("express").Router();
const communicationController = require("../controllers/communicationController");

router.post("/makeCall", communicationController.makeCall);
router.post("/sms", communicationController.sendSms);
router.post("/email", communicationController.sendEmail);

module.exports = router;
