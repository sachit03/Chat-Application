// model/conversation.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Conversation = sequelize.define("Conversation", {

  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  userA: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userB: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
Conversation.belongsTo(User, { as: "userAInfo", foreignKey: "userA" });
Conversation.belongsTo(User, { as: "userBInfo", foreignKey: "userB" });

module.exports = Conversation;
