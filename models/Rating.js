const db=require('../models/database')
const User=db.users
module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    rating_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rater_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'user_id',
      },
      allowNull: false,
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'user_id',
      },
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },{
    timestamps: false,
  }
  );

  return Rating;
};