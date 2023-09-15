'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Order.belongsTo(models.User,  {
        foreignKey: {
          allowNull: false,
        }
      })
      models.Order.belongsTo(models.Product,  {
        foreignKey: {
          allowNull: false,
        }
      })
    }
  }
  Order.init({
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: DataTypes.UUID,
    productId: DataTypes.INTEGER,
    quantite: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};