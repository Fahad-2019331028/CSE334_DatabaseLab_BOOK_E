const db=require('../models/database')
const bcrypt = require('bcryptjs');
const User=db.users
const Book=db.books
// const Book = require('../models/Book');
console.log(User)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { user_id: req.user.user_id },
      attributes: { exclude: ['password'] }, // Exclude password from response
      include: [{ model: Book, as: 'Book' }], // Include user's books
    });
 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.editUserProfile = async (req, res) => {
  const { name, phone_number, address,username,profile_picture,email,password } = req.body;

  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Update user profile information
    user.name = name?name:user.name;
    user.email = email?email:user.email;
    user.phone_number = phone_number?phone_number:user.phone_number;
    user.address = address?address:user.address;
    user.profile_picture= profile_picture?profile_picture:user.profile_picture;
    user.username = username?username:user.username;
    user.password = hashedPassword?hashedPassword:user.password;
    console.log(user)
    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getUserInventory = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userBooks = await Book.findAll({ where: { user_id: user.user_id } });

    res.status(200).json({ userInventory: userBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserRating = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRatings = await Rating.findAll({
      where: { rated_user_id: user.user_id },
      attributes: ['rating'],
    });

    res.status(200).json({ userRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await User.findByPk(user_id);
    res.json(user); // Send the user data as JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

