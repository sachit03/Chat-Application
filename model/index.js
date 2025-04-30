// const sequelize=require("../config/database");
// const User=require('./user');
// sequelize.sync({ alter: true });


// module.exports={sequelize,User};

const sequelize    = require("../config/database");
const User         = require("./user");
const Group        = require("./group");
const GroupMember  = require("./groupMember");
const GroupMessage = require("./groupMessage");

const Conversation = require("./conversation");
const Chat         = require("./chat");

Conversation.hasMany(Chat, { foreignKey: "conversationId" });
Chat.belongsTo(Conversation, { foreignKey: "conversationId" });

// Group chat associations
User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: "userId",
  otherKey: "groupId",
  as: "groups"
});
Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: "groupId",
  otherKey: "userId",
  as: "members"
});

Group.belongsTo(User, { foreignKey: "adminId", as: "admin" });
Group.hasMany(GroupMessage, { foreignKey: "groupId" });

sequelize.sync({ alter: true });

module.exports = {
  sequelize,
  User,
  Conversation,
  Chat,
  Group,
  GroupMember,
  GroupMessage
};