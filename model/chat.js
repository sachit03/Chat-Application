const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Conversation = require("./conversation");

const Chat = sequelize.define("Chat", {
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Chat.belongsTo(Conversation, { foreignKey: "conversationId" });
Conversation.hasMany(Chat, { foreignKey: "conversationId" });

module.exports = Chat;
