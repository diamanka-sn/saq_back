'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: uuidv4()
      },
      prenom: {
        allowNull: false,
        type: Sequelize.STRING
      },
      nom: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      telephone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      date_naissance: {
        allowNull: false,
        type: Sequelize.STRING
      },rue: {
        allowNull: true,
        type: Sequelize.STRING
      },
      ville: {
        allowNull: false,
        type: Sequelize.STRING
      },
      region: {
        allowNull: false,
        type: Sequelize.STRING
      },
      code: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};