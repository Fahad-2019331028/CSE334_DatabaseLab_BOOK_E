const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const User = require('../models/User');
const db=require('../models/database')

const User=db.users


exports.loginUser = async (req, res) => {
  console.log('Attempting user login...');
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        user_id: user.user_id,
      },
    };

    jwt.sign(payload, '75655', { expiresIn: '1h' }, (error, token) => {
      if (error) throw error;
      console.log('User logged in successfully');
      res.json({ token });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// main model

// main work
exports.registerUser = async (req, res) => {
  console.log('Attempting user registration...');
  const { username, name, email, phone_number, address, password } = req.body;
  
  try {
    // Check if user with the same email already exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user record in the database
    user = await User.create({
      username,
      name,
      email,
      phone_number,
      address,
      password: hashedPassword,
    });

    console.log('User registered successfully');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
