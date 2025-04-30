
const express       = require("express");
const router        = express.Router();
const jwtMiddleware = require("../middleware/jwt");
const {
  getOrCreate,
  list
} = require("../controllers/conversationController");

router.post("/api/conversations", jwtMiddleware, getOrCreate);
router.get ("/api/conversations", jwtMiddleware, list);

module.exports = router;
