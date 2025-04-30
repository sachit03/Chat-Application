const User=require("../model/user");
const fs= require("fs");
const path = require("path");
const { Op } = require("sequelize");
exports.getusers=async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const users = await User.findAll({
        where: { id: { [Op.ne]: currentUserId } },
        attributes: { exclude: ["password"] }
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
exports.uploadProfilePic =async(req,res)=>{
    try{
        const userId=req.user.id;
        const profilePicPath=req.file ? req.file.filename : null;
        if(!profilePicPath){
            return res.status(400).json({error : "No file Uploaded"});
        };
        const user=await User.findByPk(userId);
        if(!user){
           return res.status(404).json({error: "User not found"});
        };
        if(user.profilePic){
            const oldPicPath=path.join(__dirname,"..","uploads",user.profilePic);
            fs.unlink(oldPicPath,(errr)=>{
                if(errr) console.log("eror deleting old profile pic",errr); 
            });
        }
        user.profilePic=profilePicPath;
        await user.save();
        res.json({status:"Profile Pic Updated Sucessfully",profilePic : profilePicPath});
    }
    catch(error){
        res.status(500).json({Error : "Updating profile pic",details : error.message});
    }
};
exports.deleteProfilePic = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user || !user.profilePic) {
            return res.status(404).json({ error: "No profile picture found" });
        }
        const picPath = path.join(__dirname, "..", "uploads", user.profilePic);
        fs.unlink(picPath, (err) => {
            if (err) console.error("Error deleting profile pic:", err);
        });
        user.profilePic = null;
        await user.save();

        res.json({ status: "Profile picture deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting profile picture", details: error.message });
    }
};