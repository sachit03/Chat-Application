const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Group = sequelize.define("Group", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profilePic: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Group;