const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const Settings = sequelize.define("Settings", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    link_agc: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
    username_agc: {
      type: Sequelize.ENUM("0", "1"),
      allowNull: false,
      default: "1",
    },
    password_agc: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tipe_schedule: {
      type: Sequelize.ENUM("Perhari", "Perjam", "Permenit"),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("0", "1"),
      allowNull: false,
      default: "1",
    },
  });

  return Settings;
};