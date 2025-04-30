const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Group = require("./group");
const User  = require("./user");

const GroupMember = sequelize.define("GroupMember", {
  groupId: {
    type: DataTypes.UUID,
    references: { model: Group, key: "id" },
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: "id" },
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM("admin","member"),
    defaultValue: "member"
  }
}, {
  timestamps: false
});

module.exports = GroupMember;