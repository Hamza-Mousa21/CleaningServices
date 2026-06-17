'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Booking.belongsTo(models.ServiceType, {
        foreignKey: 'serviceTypeId',
        as: 'serviceType'
      });
      
      Booking.hasOne(models.GardenDetail, {
        foreignKey: 'bookingId',
        as: 'gardenDetail'
      });
      
      Booking.hasOne(models.BuildingDetail, {
        foreignKey: 'bookingId',
        as: 'buildingDetail'
      });
      
      Booking.hasOne(models.Availability, {
        foreignKey: 'bookingId',
        as: 'availability'
      });
    }
  }
  Booking.init({
    bookingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    serviceTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true
      }
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^[0-9]{10,15}$/
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['service_type_id']
      },
      {
        fields: ['booking_date']
      },
      {
        fields: ['status']
      }
    ]
  });
  return Booking;
};