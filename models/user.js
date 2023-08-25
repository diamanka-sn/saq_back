'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    prenom: DataTypes.STRING,
    nom: DataTypes.STRING,
    image: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    telephone: DataTypes.STRING,
    date_naissance: DataTypes.STRING,
    rue: DataTypes.STRING,
    ville: DataTypes.STRING,
    region: DataTypes.STRING,
    code: DataTypes.INTEGER,
    isAdmin:DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};