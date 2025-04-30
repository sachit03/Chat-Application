const{ User }=require("../model");
const bycrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const { error } = require("console");
const JWT_SECRET="*123";
exports.register=async(req,res)=>{
    const {name,email,phone,password}=req.body;
    const hashedpassword=await bycrypt.hash(password,10);
    const user = await User.create({ name, email, phone, password: hashedpassword,role: req.body.role});
    res.json({status:"User RegisterEd Sucessfully",id: user.id});
};
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(401).json({ status: "Invalid Credentials" });
      }
  
      const match = await bycrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ status: "Invalid Credentials" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      return res.json({
        status: "Login Successful",
        token,
        id: user.id,
        role: user.role
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "Server error", error: err.message });
    }
};
exports.updateuser=async(req,res)=>{
    const{id}=req.params;
    if(parseInt(req.user.id) !=parseInt(req.params.id)){
        return res.status(403).json({status: "Not authorized"});
    };
    const{name,email,phone}=req.body;
    await User.update({name,email,phone},{where:  {id: req.user.id}});
    res.json({status:"User updated Sucessfully",id});
};
exports.forgetpassword=async(req,res)=>{
    const{email}=req.body;
    const user=await User.findOne({where:{email}});
    if(! user) return res.status(404).json({status:"Invalid Credentials/User Not Found"});
    const token=jwt.sign({id: user.id},JWT_SECRET,{expiresIn: "15m"});
    res.json({status:"Token Generated",token});
};
exports.resetpassword=async(req,res)=>{
    const token = req.headers.authorization?.split(" ")[1];
    const{newpassword}=req.body;
    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedpassword=await bycrypt.hash(newpassword,10);
        await User.update({password:hashedpassword},{where: {id:decoded.id}});
        res.json({status:"Password Updated Sucessfully"});
    }
     catch{
        return res.status(404).json({status: "Credential Failed to verify"});
     }
};
