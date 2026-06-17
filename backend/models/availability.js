'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Availability extends Model {
    static associate(models) {
      Availability.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking',
        constraints: false
      });
    }
  }
  Availability.init({
    availabilityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    availableDate: {
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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    isBooked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Availability',
    tableName: 'availability',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['available_date', 'start_time']
      },
      {
        fields: ['available_date']
      },
      {
        fields: ['is_booked']
      },
      {
        fields: ['booking_id']
      }
    ]
  });
  return Availability;
};