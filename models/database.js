const {Sequelize, DataTypes} = require('sequelize');

// Replace these values with your own MySQL database credentials
const database = 'booke';
const username = 'root';
const password = 'FahadBM32';
const host = 'localhost';
const dialect = 'mysql';

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
  operatorsAliases: false,
});

sequelize.authenticate()
.then(()=>{
    console.log("Connected..");
})
.catch(err=>{
  console.log("Error"+err)
}) 

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./User.js')(sequelize, DataTypes);
db.books = require('./Book.js')(sequelize, DataTypes);
db.orders = require('./Order.js')(sequelize, DataTypes);
db.reviews = require('./Review.js')(sequelize, Sequelize);
// db.orders = require('./Order')(sequelize, Sequelize);
// db.Post = require('./Post')(sequelize, Sequelize);
db.ratings = require('./Rating')(sequelize, Sequelize);
db.genres = require('./Genre')(sequelize, Sequelize);


db.sequelize.sync({force: false})
.then(()=>{
  console.log("Yes. Re-sync done")
})


db.users.hasMany(db.books,{
  foreignKey: 'user_id',
  as: 'Book'
});
db.books.belongsTo(db.users,{
  foreignKey: 'user_id',
  as: 'User'
});
db.users.hasMany(db.orders, {
  foreignKey: 'buyer_id',
  as: 'orders', // Alias for the Orders (Order) model
});
db.users.hasMany(db.orders, {
  foreignKey: 'seller_id',
  as: 'sales', // Alias for the Sales (Order) model
});
db.books.hasOne(db.orders, {
  foreignKey: 'book_id',
  as: 'order', // Alias for the Order model
});
db.orders.belongsTo(db.books, {
  foreignKey: 'book_id',
  as: 'Book', // Alias for the Book model
});
db.orders.belongsTo(db.users, {
  foreignKey: 'buyer_id',
  as: 'buyer', // Alias for the Buyer (User) model
});

db.orders.belongsTo(db.users, {
  foreignKey: 'seller_id',
  as: 'seller', // Alias for the Seller (User) model
});
db.reviews.belongsTo(db.books, {
  foreignKey: 'recipient_id',
  as: 'Recipient', // Alias for the Book model
});
db.reviews.belongsTo(db.users, {
  foreignKey: 'reviewer_id',
  as: 'Reviewer', // Alias for the Buyer (User) model
});

db.ratings.belongsTo(db.users, {
  foreignKey: 'recipient_id',
  as: 'Recipient', // Alias for the Seller (User) model
});

db.ratings.belongsTo(db.users, {
  foreignKey: 'rater_id',
  as: 'Rater', // Alias for the Seller (User) model
});
module.exports = db;
