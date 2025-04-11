const router = require("express").Router();
const statusController = require("../controllers/statusController");

router.post("/handle-status", statusController.handleStatusChange);

module.exports = router;
