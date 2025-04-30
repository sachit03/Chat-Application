const Chat = require("../model/chat");
const Conversation = require("../model/conversation");  

exports.saveMessage = async (data) => {
  try {
    const conversationId = data.conversationId || data.connectionId;
    if (!conversationId) {
      console.error("saveMessage called without conversationId:", data);
      return;
    }
    const [userA, userB] = conversationId
      .split("_")
      .map((id) => parseInt(id, 10));
    await Conversation.findOrCreate({
      where: { id: conversationId },
      defaults: { id: conversationId, userA, userB },
    });
    await Chat.create({
      conversationId,
      senderId:   data.senderId,
      receiverId: data.receiverId,
      message:    data.message,
    });
  } catch (err) {
    console.error("Error saving chat message:", err);
  }
};


exports.getChatHistory = async (req, res) => {
  const conversationId = req.params.conversationId || req.params.connectionId;
  if (!conversationId) {
    return res.status(400).json({ error: "No conversationId provided" });
  }

  try {
    const chats = await Chat.findAll({
      where: { conversationId },
      order: [["timestamp", "ASC"]],
    });
    res.json(chats);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { newText } = req.body;
  const userId = req.user.id;
  const msg = await Chat.findByPk(messageId);
  if (!msg) return res.status(404).json({ error: "Message not found" });
  if (msg.senderId !== userId) return res.status(403).json({ error: "Not your message" });

  await Chat.update(
    { message: newText },
    { where: { id: messageId } }
  );
  req.io.to(msg.conversationId).emit("messageEdited", { messageId, newText });
  res.json({ status: "Message edited" });
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const msg = await Chat.findByPk(messageId);
  if (!msg) return res.status(404).json({ error: "Message not found" });
  if (msg.senderId !== userId) return res.status(403).json({ error: "Not your message" });

  await Chat.destroy({ where: { id: messageId } });
  req.io.to(msg.conversationId).emit("messageDeleted", { messageId });
  res.json({ status: "Message deleted" });
};


