const express = require("express");
const router  = express.Router();
const jwt     = require("../middleware/jwt");
const gc      = require("../controllers/groupController");
const { leaveGroup,editGroupMessage, deleteGroupMessage,addGroupMember, removeGroupMember,promoteToAdmin,
  deleteGroup } = require("../controllers/groupController");


router.post("/api/groups", jwt, gc.createGroup);

router.get("/api/groups", jwt, gc.listGroups);

router.get("/api/groups/:groupId/history", jwt, gc.getGroupHistory);
router.delete(
    "/api/groups/:groupId/leave",
    jwt,             
    leaveGroup
  );
  router.post(
    "/api/groups/:groupId/members",
    jwt,
    addGroupMember
  );
  
  // Only admin can remove:
  router.delete(
    "/api/groups/:groupId/members/:targetUserId",
    jwt,
    removeGroupMember
  );
  router.patch(
    "/api/groups/:groupId/members/:targetUserId/promote",
    jwt,
    promoteToAdmin
  );
  
  router.delete(
    "/api/groups/:groupId",
    jwt,
    deleteGroup
  );
module.exports = router;
router.patch("/api/groups/messages/:messageId", jwt, editGroupMessage);
router.delete("/api/groups/messages/:messageId", jwt, deleteGroupMessage);
