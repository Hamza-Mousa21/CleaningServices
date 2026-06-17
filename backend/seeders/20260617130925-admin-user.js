'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    // Check if admin already exists
    const adminExists = await queryInterface.sequelize.query(
      `SELECT * FROM users WHERE email = 'admin@example.com'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (adminExists.length > 0) {
      console.log('Admin user already exists, skipping seed.');
      return;
    }

    // Insert admin user
    return queryInterface.bulkInsert('users', [
      {
        full_name: 'Administrator',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the admin user
    return queryInterface.bulkDelete('users', { 
      email: 'admin@example.com' 
    }, {});
  }
};