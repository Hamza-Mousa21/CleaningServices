'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BuildingDetail extends Model {
    static associate(models) {
      BuildingDetail.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking'
      });
    }
  }
  BuildingDetail.init({
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
    numFloors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'BuildingDetail',
    tableName: 'building_details',
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
  return BuildingDetail;
};