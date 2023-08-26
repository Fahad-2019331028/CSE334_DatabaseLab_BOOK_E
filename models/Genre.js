module.exports = (sequelize, DataTypes) => {
    const Genre = sequelize.define('Genre', {
      genre_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    });
  
    return Genre;
  };
  