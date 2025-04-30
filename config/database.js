const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("userdatabase", "root", "Usar@2021", {
  dialect: "mysql",
  logging: false,
  define: {
    timestamps: false,
  },
});
sequelize.sync();
module.exports = sequelize;
