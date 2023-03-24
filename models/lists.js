const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const Lists = sequelize.define("Lists", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
    link: {
      type: Sequelize.STRING(250),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("0", "1"),
      allowNull: false,
      default: "1",
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  return Lists;
};