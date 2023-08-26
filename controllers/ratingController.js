//NOTE: We have used sequelize for better security and sanitization. But we have also done this with raw SQL queries. We have added the raw sql query implementation below commented

const db=require('../models/database')
const { Op } = require('sequelize');
const Rating = db.ratings;
const User = db.users;
const Order = db.orders; 
exports.addRating = async (req, res) => {
  const { rating, recipient_id } = req.body;
  const rater_id = req.user.user_id; 
  console.log(req.body)
  try {
    const existingRating = await Rating.findOne({
      where: { recipient_id: recipient_id, rater_id },
    });
    
    if (rating > 10 || rating < 0) {
      return res.status(400).json({ message: 'The rating is out of bounds' });
    }
    
    if (recipient_id === rater_id) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }
    
    const orders = await Order.findAll({
      where: {
        [Op.or]: [
          { buyer_id: rater_id },
          { seller_id: rater_id }
        ]
      }
    });
    console.log(rater_id)
    const canAddRating = orders.some(order => 
      (Number(order.buyer_id) === Number(recipient_id) && Number(order.seller_id) === Number(rater_id)) ||
      (Number(order.seller_id) === Number(recipient_id) && Number(order.buyer_id) === Number(rater_id))
    );
    console.log(orders)
    orders.some(order=>
    console.log(order.buyer_id===recipient_id)
    );
    console.log(canAddRating)
    if (!canAddRating) {
      return res.status(400).json({ message: 'No direct connection for rating' });
    }
  
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    }
 
    const newRating = await Rating.create({
      rater_id,
      recipient_id,
      rating,
    });

    res.status(201).json({ message: 'Rating added successfully', rating: newRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getRatingsAndAverageByRecipient = async (req, res) => {
    const { user_id } = req.params;
    console.log("Inside getting rating")
    try {
      const ratings = await Rating.findAll({
        where: { recipient_id: user_id },
      });
  
      const ratingCount = ratings.length;
      let totalRating = 0;
  
      for (const rating of ratings) {
        totalRating += rating.rating;
      }
  
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      console.log(averageRating)
      res.status(200).json({ ratingCount, averageRating });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };


//Raw Sql Query Impementation

// const db = require('../models/database');
// const sequelize = db.sequelize; // Use the sequelize instance from database.js
// const Rating = db.ratings; // Note: Use the raw SQL query method defined in database.js

// exports.addRating = async (req, res) => {
//   const { rating, recipient_id } = req.body;
//   const rater_id = req.user.user_id; // Assuming you have user authentication implemented

//   try {
//     if (rating > 10 || rating < 0) {
//       return res.status(400).json({ message: 'The rating is out of bounds' });
//     }
//     if (recipient_id === rater_id) {
//       return res.status(400).json({ message: 'Cannot rate yourself' });
//     }

//     const getExistingRatingQuery = `
//       SELECT * FROM ratings WHERE recipient_id = ? AND rater_id = ?
//     `;
//     const [existingRating] = await sequelize.query(getExistingRatingQuery, {
//       replacements: [recipient_id, rater_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (existingRating) {
//       const updateRatingQuery = `
//         UPDATE ratings
//         SET rating = ?
//         WHERE recipient_id = ? AND rater_id = ?
//       `;
//       await sequelize.query(updateRatingQuery, {
//         replacements: [rating, recipient_id, rater_id],
//         type: sequelize.QueryTypes.UPDATE
//       });

//       return res.json({ message: 'Rating updated successfully', rating: { ...existingRating, rating } });
//     }

//     const addRatingQuery = `
//       INSERT INTO ratings (rater_id, recipient_id, rating)
//       VALUES (?, ?, ?)
//     `;
//     await sequelize.query(addRatingQuery, {
//       replacements: [rater_id, recipient_id, rating],
//       type: sequelize.QueryTypes.INSERT
//     });

//     res.status(201).json({ message: 'Rating added successfully', rating: { rater_id, recipient_id, rating } });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getRatingsAndAverageByRecipient = async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     const getRatingsQuery = `
//       SELECT * FROM ratings WHERE recipient_id = ?
//     `;
//     const ratings = await sequelize.query(getRatingsQuery, { replacements: [user_id], type: sequelize.QueryTypes.SELECT });

//     const ratingCount = ratings.length;
//     let totalRating = 0;

//     for (const rating of ratings) {
//       totalRating += rating.rating;
//     }

//     const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

//     res.status(200).json({ ratingCount, averageRating });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

