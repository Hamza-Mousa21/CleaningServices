'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Booking, {
        foreignKey: 'userId',
        as: 'bookings'
      });
    }
  }
  User.init({
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      }
    ]
  });
  return User;
};