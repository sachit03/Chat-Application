const User=require("../model/user");
const bycrypt=require('bcrypt');
exports.createAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hashedPassword = await bycrypt.hash(password, 10);
  const adminUser = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: "admin" 
  });
  res.json({ status: "User Registered Successfully", id: adminUser.id });
};
exports.getAllUsers=async(req,res)=>{
    try{
        const users=await User.findAll({attributes :{exclude:["password"]}});
        res.json(users);
    }
    catch (error){
        res.status(500).json({error: "Error fetching users",details: error.message});
    }
};
exports.updateUserByAdmin = async (req, res) => {
    try {
      const { id } = req.params;
      await User.update(req.body, { where: { id } });
      res.json({ status: "User updated by admin successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error updating user", details: error.message });
    }
  };
  exports.deleteUserByAdmin = async (req, res) => {
    try {
      const { id } = req.params;
      await User.destroy({ where: { id } });
      res.json({ status: "User deleted by admin successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting user", details: error.message });
    }
  };