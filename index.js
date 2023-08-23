const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./models/database'); // Import Sequelize models

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({extended: true}));
// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/book', require('./routes/bookRoutes'));
// app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/order', require('./routes/orderRoutes'));
app.use('/api/review', require('./routes/reviewRoutes'));
app.use('/api/rating', require('./routes/ratingRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
