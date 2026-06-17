'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GardenDetail extends Model {
    static associate(models) {
      GardenDetail.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking'
      });
    }
  }
  GardenDetail.init({
    detailId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    gardenSizeKm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0.01
      }
    }
  }, {
    sequelize,
    modelName: 'GardenDetail',
    tableName: 'garden_details',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['booking_id']
      }
    ]
  });
  return GardenDetail;
};