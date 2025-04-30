const{ DataTypes}=require('sequelize');
const sequelize=require("../config/database");
const User=sequelize.define("User",{
    name :{type :DataTypes.STRING,allowNull:false},
    email:{type:DataTypes.STRING,allowNull:false},
    phone:{type:DataTypes.STRING,allowNull:false},
    password:{type: DataTypes.STRING,allowNull:false},
    role :{type:DataTypes.ENUM("user","admin"),allowNull: false,defaultValue: "user"},
    profilePic :{type : DataTypes.STRING,allowNull: true},
});
module.exports=User;