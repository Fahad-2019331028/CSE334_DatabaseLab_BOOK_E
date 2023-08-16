module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
      rating_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'user_id',
        },
        allowNull: false,
      },
      rated_user_id: {
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    });
  
    // Define associations or methods here if needed
  
    return Rating;
  };
  