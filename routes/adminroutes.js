const express = require("express");
const router = express.Router();
const authorize=require("../middleware/authorize");
const jwtmiddleware=require("../middleware/jwt");
const {getAllUsers,deleteUserByAdmin,updateUserByAdmin,createAdmin}=require("../controllers/admincontrollers");
router.post(
    "/api/admin/create",
    jwtmiddleware,
    authorize(["admin"]), 
    createAdmin
  );
router.get("/api/admin/getallusers",jwtmiddleware,authorize(["admin"]),getAllUsers);
router.patch("/api/admin/updateuser/:id",jwtmiddleware,authorize(["admin"]),updateUserByAdmin);
router.delete("/api/admin/deleteuser/:id",jwtmiddleware,authorize(["admin"]),deleteUserByAdmin);
module.exports=router;