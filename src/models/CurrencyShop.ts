import { Sequelize, DataTypes } from "sequelize";

module.exports = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  return sequelize.define(
    "currency_shop",
    {
      name: {
        type: dataTypes.STRING,
        unique: true,
      },
      cost: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};