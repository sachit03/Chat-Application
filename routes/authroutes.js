const express=require('express');
const { register,login, getuser, updateuser, forgetpassword, resetpassword }=require('../controllers/authcontrollers');
const router=express.Router();
const jwtmiddleware=require("../middleware/jwt");
//unauthorized routes
router.post("/api/register",register);
router.post("/api/login",login);
router.post("/api/forget",forgetpassword);
//authorized routes
router.patch("/api/update/:id",jwtmiddleware,updateuser);
router.post("/api/reset",jwtmiddleware,resetpassword);
module.exports=router;