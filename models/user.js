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
      models.User.hasMany(models.Order)
      models.User.hasOne(models.Note)
    }
  }
  User.init({
    id: { type: DataTypes.UUID, primaryKey: true },
    prenom: DataTypes.STRING,
    nom: DataTypes.STRING,
    image: DataTypes.STRING,
    email: DataTypes.STRING,
    sexe: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    telephone: DataTypes.STRING,
    date_naissance: DataTypes.STRING,
    rue: DataTypes.STRING,
    ville: DataTypes.STRING,
    region: DataTypes.STRING,
    isAdmin:DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};