const router = require("express").Router();
const videoController = require("../controllers/videoController");

router.get("/token", videoController.getVideoToken);

module.exports = router;
