'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('availability', {
      availability_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      available_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      is_booked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'bookings',
          key: 'booking_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // Add unique constraint
    await queryInterface.addConstraint('availability', {
      fields: ['available_date', 'start_time'],
      type: 'unique',
      name: 'unique_time_slot'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('availability');
  }
};