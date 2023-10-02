'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Product.belongsTo(models.Categorie,  {
        foreignKey: {
          allowNull: false,
        }
      })
      models.Product.hasMany(models.Order)
      models.Product.hasMany(models.Note)
    }
  }
  Product.init({
    id: { type: DataTypes.UUID, primaryKey: true },
    categorieId:DataTypes.UUID,
    nom: DataTypes.STRING,
    description: DataTypes.STRING,
    prix: DataTypes.INTEGER,
    quantite: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};