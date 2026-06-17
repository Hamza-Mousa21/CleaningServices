'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      booking_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      service_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'service_types',
          key: 'service_type_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      booking_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      special_instructions: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('bookings');
  }
};