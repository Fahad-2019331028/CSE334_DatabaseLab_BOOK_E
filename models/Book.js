// const db=require('../models/Database')

// const User=db.users
module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('Book', {
      book_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      book_condition: {
        type: DataTypes.ENUM('new', 'used'),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull:true
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'user_id',
        },
      },
      is_for_sale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_for_loan: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_for_giveaway: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      genre: {
        type: DataTypes.STRING, // Assuming the genre is a string
        allowNull: true, // You can set this to false if genre is required
      },
      book_img_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transaction:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }

    },{
      timestamps: false,
    }
    );
  
    // Define associations or methods here if needed
    // Book.belongsTo(User, { as: 'user'}); // Owner of the book
    // Book.belongsTo(User, { as: 'orderedBy' }); // User who ordered the book

    return Book;
  };
  



