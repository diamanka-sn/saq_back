'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Note.belongsTo(models.User,  {
        foreignKey: {
          allowNull: false,
        }
      })
      models.Note.belongsTo(models.Product,  {
        foreignKey: {
          allowNull: false,
        }
      })
    }
  }
  Note.init({
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: DataTypes.UUID,
    productId: DataTypes.UUID,
    note: DataTypes.NUMBER,
    avis: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Note',
  });
  return Note;
};