const router = require("express").Router();
const lookupController = require("../controllers/lookupController");

router.post("/validate", lookupController.validatePhoneNumber);

module.exports = router;
