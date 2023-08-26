//NOTE: We have used sequelize for better security and sanitization. But we have also done this with raw SQL queries. We have added the raw sql query implementation below commented

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

    jwt.sign(payload, '75655', { expiresIn: '72h' }, (error, token) => {
      if (error) throw error;
      console.log('User logged in successfully');
      res.json({ token });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.registerUser = async (req, res) => {
  console.log('Attempting user registration...');
  const { username, name, email, phone_number, address, password } = req.body;
  
  try {

    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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



//Raw Sql Query Impementation

// const db = require('../models/database');
// const sequelize = db.sequelize;
// const User = db.users;
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { Op } = require('sequelize');

// exports.registerUser = async (req, res) => {
//   const { username, name, email, phone_number, address, password, profile_picture } = req.body;

//   try {
//     // Check if the email or username already exists
//     const checkExistingQuery = `
//       SELECT * FROM users
//       WHERE email = ? OR username = ?
//     `;
//     const existingUser = await sequelize.query(checkExistingQuery, {
//       replacements: [email, username],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (existingUser.length > 0) {
//       return res.status(400).json({ message: 'Username or email already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const createUserQuery = `
//       INSERT INTO users (username, name, email, phone_number, address, password, profile_picture)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `;
//     await sequelize.query(createUserQuery, {
//       replacements: [username, name, email, phone_number, address, hashedPassword, profile_picture],
//       type: sequelize.QueryTypes.INSERT
//     });

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// exports.loginUser = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const getUserQuery = `
//       SELECT * FROM users WHERE username = ?
//     `;
//     const [user] = await sequelize.query(getUserQuery, {
//       replacements: [username],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid username or password' });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid username or password' });
//     }

//     const token = jwt.sign({ user_id: user.user_id }, 'your_secret_key', { expiresIn: '1h' });

//     res.json({ token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getUserProfile = async (req, res) => {
//   const user_id = req.user.user_id;

//   try {
//     const getUserProfileQuery = `
//       SELECT user_id, username, email FROM users WHERE user_id = ?
//     `;
//     const [user] = await sequelize.query(getUserProfileQuery, {
//       replacements: [user_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = exports;
