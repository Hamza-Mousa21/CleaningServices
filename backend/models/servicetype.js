'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServiceType extends Model {
    static associate(models) {
      ServiceType.hasMany(models.Booking, {
        foreignKey: 'serviceTypeId',
        as: 'bookings'
      });
    }
  }
  ServiceType.init({
    serviceTypeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('garden', 'building'),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    durationHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        notEmpty: true
      }
    },
    pricePerUnit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    pricePerKm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'ServiceType',
    tableName: 'service_types',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        fields: ['category']
      }
    ]
  });
  return ServiceType;
};