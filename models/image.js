'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Image.belongsTo(models.Product,  {
        foreignKey: {
          allowNull: false,
        }
      })
    }
  }
  Image.init({
    id: { type: DataTypes.UUID, primaryKey: true },
    productId: DataTypes.UUID,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};