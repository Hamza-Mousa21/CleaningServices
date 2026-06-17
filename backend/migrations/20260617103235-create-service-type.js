'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_types', {
      service_type_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      service_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('garden', 'building'),
        allowNull: false
      },
      duration_hours: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price_per_unit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      price_per_km: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_types');
  }
};