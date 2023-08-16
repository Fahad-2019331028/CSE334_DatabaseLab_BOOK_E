const db=require('../models/database')

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
  const { name, email, phone_number, address } = req.body;

  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile information
    user.name = name;
    user.email = email;
    user.phone_number = phone_number;
    user.address = address;
    if(req.file)
    {
      user.profile_picture=req.file.path
      console.log(req.file.path)
    }
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

exports.getUserById = async (req,res) => {
  const { book_id } = req.params;
  try {
    const user = await User.findOne({ where: { book_id } });
    return user;
  } catch (error) {
    throw new Error('Error fetching user by user_id: ' + error.message);
  }
};