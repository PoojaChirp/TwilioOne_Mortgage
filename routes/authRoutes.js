const router = require("express").Router();
const { verify, verifyCheck } = require("../controllers/authController");

router.post("/verify", verify);
router.post("/verify/check", verifyCheck);

module.exports = router;
