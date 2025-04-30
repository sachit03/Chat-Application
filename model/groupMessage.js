const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Group     = require("./group");
const User      = require("./user");

const GroupMessage = sequelize.define("GroupMessage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  groupId: {
    type: DataTypes.UUID,
    references: { model: Group, key: "id" },
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: "id" },
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

Group.hasMany(GroupMessage, { foreignKey: "groupId" });
GroupMessage.belongsTo(Group, { foreignKey: "groupId" });
GroupMessage.belongsTo(User, { as: "sender", foreignKey: "senderId" });

module.exports = GroupMessage;