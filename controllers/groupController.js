// const { Group, GroupMember, GroupMessage, User } = require("../model");

// // Create a new group
// exports.createGroup = async (req, res) => {
//   try {
//     const { name, userIds } = req.body; // userIds: array of ints
//     const adminId = req.user.id;

//     // 1) create group
//     const group = await Group.create({ name, adminId });

//     // 2) add members (admin + others)
//     const allIds = Array.from(new Set([adminId, ...(userIds || [])]));
//     const bulk = allIds.map(id => ({
//       groupId: group.id,
//       userId: id,
//       role: id === adminId ? "admin" : "member"
//     }));
//     await GroupMember.bulkCreate(bulk);

//     res.json({ status: "Group created", group });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // List all groups current user belongs to
// exports.listGroups = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const groups = await Group.findAll({
//       include: [{
//         model: User,
//         as: "members",
//         attributes: ["id","name","email"]
//       }],
//       where: { "$members.id$": userId }
//     });
//     res.json(groups);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get group message history
// exports.getGroupHistory = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const msgs = await GroupMessage.findAll({
//       where: { groupId },
//       include: [{ model: User, as: "sender", attributes: ["id","name"] }],
//       order: [["timestamp","ASC"]]
//     });
//     res.json(msgs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Save incoming group message (for socket)
// exports.saveGroupMessage = async (data) => {
//   try {
//     await GroupMessage.create({
//       groupId:  data.groupId,
//       senderId: data.senderId,
//       message:  data.message
//     });
//   } catch (err) {
//     console.error("Error saving group message:", err);
//   }
// };

// exports.leaveGroup = async (req, res) => {
//   const userId  = req.user.id;
//   const { groupId } = req.params;

//   try {
//     // 1) Remove membership
//     const deleted = await GroupMember.destroy({
//       where: { groupId, userId }
//     });
//     if (!deleted) {
//       return res.status(404).json({ error: "You are not a member of this group." });
//     }

//     // 2) Delete all your past messages in that group
//     await GroupMessage.destroy({
//       where: { groupId, senderId: userId }
//     });

//     // 3) Optionally broadcast a “user left” message to remaining members
//     req.io && req.io.to(`group_${groupId}`)
//       .emit("groupMemberLeft", { groupId, userId });

//     return res.json({ status: "You have left the group; your messages have been removed." });
//   } catch (err) {
//     console.error("leaveGroup error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };


// // Edit a group message
// exports.editGroupMessage = async (req, res) => {
//   const { messageId } = req.params;
//   const { newText } = req.body;
//   const userId = req.user.id;

//   const msg = await GroupMessage.findByPk(messageId);
//   if (!msg) return res.status(404).json({ error: "Message not found" });
//   if (msg.senderId !== userId) return res.status(403).json({ error: "Not your message" });

//   await GroupMessage.update({ message: newText }, { where: { id: messageId } });
//   req.io.to(`group_${msg.groupId}`)
//          .emit("groupMessageEdited", { messageId, newText });
//   res.json({ status: "Group message edited" });
// };

// // Delete a group message
// exports.deleteGroupMessage = async (req, res) => {
//   const { messageId } = req.params;
//   const userId = req.user.id;

//   const msg = await GroupMessage.findByPk(messageId);
//   if (!msg) return res.status(404).json({ error: "Message not found" });
//   if (msg.senderId !== userId) return res.status(403).json({ error: "Not your message" });

//   await GroupMessage.destroy({ where: { id: messageId } });
//   req.io.to(`group_${msg.groupId}`)
//          .emit("groupMessageDeleted", { messageId });
//   res.json({ status: "Group message deleted" });
// };
// controllers/groupController.js
const { Group, GroupMember, GroupMessage, User } = require("../model");
exports.createGroup = async (req, res) => {
  try {
    const { name, userIds } = req.body;
    const adminId = req.user.id;
    const group = await Group.create({ name, adminId });
    const allIds = Array.from(new Set([adminId, ...(userIds || [])]));
    const bulk = allIds.map(id => ({
      groupId: group.id,
      userId: id,
      role: id === adminId ? "admin" : "member"
    }));
    await GroupMember.bulkCreate(bulk);

    res.json({ status: "Group created", group });
  } catch (err) {
    console.error("createGroup error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.listGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.findAll({
      include: [{
        model: User,
        as: "members",
        attributes: ["id", "name", "email"]
      }],
      where: { "$members.id$": userId }
    });
    res.json(groups);
  } catch (err) {
    console.error("listGroups error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getGroupHistory = async (req, res) => {
  try {
    const { groupId } = req.params;
    const msgs = await GroupMessage.findAll({
      where: { groupId },
      include: [{ model: User, as: "sender", attributes: ["id", "name"] }],
      order: [["timestamp", "ASC"]]
    });
    const formatted = msgs.map(m => ({
      id:         m.id,
      groupId:    m.groupId,
      senderId:   m.senderId,
      senderName: m.sender.name,
      message:    m.message,
      timestamp:  m.timestamp
    }));
    res.json(formatted);
  } catch (err) {
    console.error("getGroupHistory error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Save incoming group message (for socket)
/**
 * Persist a group message and broadcast it.
 * @param {{ groupId, senderId, message }} data 
 * @param {SocketIO.Server} io
 */
exports.saveGroupMessage = async (data, io) => {
  try {
    const msg = await GroupMessage.create({
      groupId:  data.groupId,
      senderId: data.senderId,
      message:  data.message
    });
    const sender = await User.findByPk(data.senderId, { attributes: ["name"] });
    io.to(`group_${data.groupId}`).emit("receiveGroupMessage", {
      id:         msg.id,
      groupId:    msg.groupId,
      senderId:   msg.senderId,
      senderName: sender.name,
      message:    msg.message,
      timestamp:  msg.timestamp
    });
  } catch (err) {
    console.error("saveGroupMessage error:", err);
  }
};
exports.leaveGroup = async (req, res) => {
  const userId  = req.user.id;
  const { groupId } = req.params;

  try {
    const deleted = await GroupMember.destroy({
      where: { groupId, userId }
    });
    if (!deleted) {
      return res.status(404).json({ error: "You are not a member of this group." });
    }
    await GroupMessage.destroy({
      where: { groupId, senderId: userId }
    });
    req.io.to(`group_${groupId}`)
          .emit("groupMemberLeft", { groupId, userId });

    res.json({ status: "You have left the group; your messages removed." });
  } catch (err) {
    console.error("leaveGroup error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.editGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newText }   = req.body;
    const userId        = req.user.id;

    const msg = await GroupMessage.findByPk(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    if (msg.senderId !== userId) return res.status(403).json({ error: "Not your message" });

    await msg.update({ message: newText });
    const sender = await User.findByPk(userId, { attributes: ["name"] });
    req.io.to(`group_${msg.groupId}`)
          .emit("groupMessageEdited", {
            messageId,
            newText,
            senderName: sender.name
          });

    res.json({ status: "Group message edited" });
  } catch (err) {
    console.error("editGroupMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId        = req.user.id;
    const msg           = await GroupMessage.findByPk(messageId);

    if (!msg) return res.status(404).json({ error: "Message not found" });
    if (msg.senderId !== userId) return res.status(403).json({ error: "Not your message" });

    await msg.destroy();
    req.io.to(`group_${msg.groupId}`)
          .emit("groupMessageDeleted", { messageId });

    res.json({ status: "Group message deleted" });
  } catch (err) {
    console.error("deleteGroupMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.addGroupMember = async (req, res) => {
  const userId  = req.user.id;
  const { groupId } = req.params;
  const { newUserId } = req.body;

  try {
    const isInGroup = await GroupMember.findOne({ where: { groupId, userId } });
    if (!isInGroup) {
      return res.status(403).json({ error: "You are not a member of this group." });
    }
    const target = await User.findByPk(newUserId);
    if (!target) {
      return res.status(404).json({ error: "User not found." });
    }
    const already = await GroupMember.findOne({ where: { groupId, userId: newUserId } });
    if (already) {
      return res.status(400).json({ error: "User is already a member." });
    }
    await GroupMember.create({ groupId, userId: newUserId, role: "member" });
    req.io.to(`group_${groupId}`).emit("groupMemberAdded", {
      groupId,
      userId: newUserId,
      userName: target.name
    });

    res.json({ status: "Member added", userId: newUserId });
  } catch (err) {
    console.error("addGroupMember error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.removeGroupMember = async (req, res) => {
  const adminId = req.user.id;
  const { groupId, targetUserId } = req.params;

  try {
    const group = await Group.findByPk(groupId);
    if (!group || group.adminId !== adminId) {
      return res.status(403).json({ error: "Only the group admin can remove members." });
    }
    if (parseInt(targetUserId,10) === adminId) {
      return res.status(400).json({ error: "Admin cannot remove themselves." });
    }
    const deleted = await GroupMember.destroy({ where: { groupId, userId: targetUserId } });
    if (!deleted) {
      return res.status(404).json({ error: "User is not a member." });
    }
    await GroupMessage.destroy({ where: { groupId, senderId: targetUserId } });
    req.io.to(`group_${groupId}`).emit("groupMemberRemoved", {
      groupId,
      userId: parseInt(targetUserId,10)
    });

    res.json({ status: "Member removed", userId: targetUserId });
  } catch (err) {
    console.error("removeGroupMember error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.promoteToAdmin = async (req, res) => {
  const requesterId = req.user.id;
  const { groupId, targetUserId } = req.params;

  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.adminId !== requesterId) {
      return res.status(403).json({ error: "Only group creator can promote admins." });
    }
    const membership = await GroupMember.findOne({ where: { groupId, userId: targetUserId } });
    if (!membership) {
      return res.status(404).json({ error: "User is not a member of this group." });
    }
    await membership.update({ role: "admin" });
    req.io.to(`group_${groupId}`)
      .emit("groupMemberPromoted", { groupId, userId: parseInt(targetUserId,10) });

    res.json({ status: "Member promoted to admin", userId: targetUserId });
  } catch (err) {
    console.error("promoteToAdmin error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.deleteGroup = async (req, res) => {
  const requesterId = req.user.id;
  const { groupId } = req.params;

  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.adminId !== requesterId) {
      return res.status(403).json({ error: "Only group creator can delete group." });
    }

    
    await GroupMessage.destroy({ where: { groupId } });
    await GroupMember.destroy({ where: { groupId } });
    await group.destroy();

    
    req.io.to(`group_${groupId}`).emit("groupDeleted", { groupId });
    res.json({ status: "Group deleted successfully" });
  } catch (err) {
    console.error("deleteGroup error:", err);
    res.status(500).json({ error: err.message });
  }
};

