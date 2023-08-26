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
  const { name, phone_number, address,username,profile_picture,email,password,confirm_password } = req.body;

  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch)
    let change=null;
    let hashedPassword;
    console.log(confirm_password)
    const isMatch = await bcrypt.compare(password, user.password);

// ...

    if (confirm_password) {
      if (password === confirm_password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(confirm_password, salt);
        change = 1;
      } else {
        console.log('Passwords do not match');
        return res.status(400).json({ message: 'Passwords do not match' });
      }
    } else if (!isMatch) {
      console.log('Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    // Update user profile information
    user.name = name?name:user.name;
    user.email = email?email:user.email;
    user.phone_number = phone_number?phone_number:user.phone_number;
    user.address = address?address:user.address;
    user.profile_picture= profile_picture?profile_picture:user.profile_picture;
    user.username = username?username:user.username;
    user.password = change?hashedPassword:user.password;
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

