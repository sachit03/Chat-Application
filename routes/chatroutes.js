const express = require("express");
const router = express.Router();
const { getChatHistory,editMessage, deleteMessage } = require("../controllers/chatController");
const jwtMiddleware = require("../middleware/jwt");

router.get("/api/chathistory/:conversationId", jwtMiddleware, getChatHistory);
router.patch("/api/chats/:messageId", jwtMiddleware, editMessage);
router.delete("/api/chats/:messageId", jwtMiddleware, deleteMessage);
module.exports = router;