//NOTE: We have used sequelize for better security and sanitization. But we have also done this with raw SQL queries. We have added the raw sql query implementation below commented

const db=require('../models/database')
const { Op } = require('sequelize');
const Review = db.reviews;
const User = db.users;
const Order = db.orders; 
exports.addReview = async (req, res) => {
  console.log("Adding review")
  const { review, recipient_id } = req.body;
  const reviewer_id = req.user.user_id; 

  try {
    const existingReview = await Review.findOne({
      where: { recipient_id: recipient_id, reviewer_id },
    });
    if(recipient_id==reviewer_id)
      return res.status(400).json({ message: 'Cannot review'});
    if (existingReview) {
      existingReview.review = review;
      await existingReview.save();
      return res.json({ message: 'Rating updated successfully', review: existingReview });
    }
    const orders = await Order.findAll({
      where: {
        [Op.or]: [
          { buyer_id: reviewer_id },
          { seller_id: reviewer_id }
        ]
      }
    });
    console.log(reviewer_id)
    const canAddReview = orders.some(order => 
      (Number(order.buyer_id) === Number(recipient_id) && Number(order.seller_id) === Number(reviewer_id)) ||
      (Number(order.seller_id) === Number(recipient_id) && Number(order.buyer_id) === Number(reviewer_id))
    );
    console.log(orders)
    orders.some(order=>
    console.log(order.buyer_id===recipient_id)
    );
    console.log(canAddReview)
    if (!canAddReview) {
      return res.status(400).json({ message: 'No direct connection for rating' });
    }
    const newreview = await Review.create({
      reviewer_id,
      recipient_id: recipient_id,
      review,
    });
    console.log("Review added")
    res.status(201).json({ message: 'Review added successfully', review:newreview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReviewsByRecipient = async (req, res) => {
    const { user_id } = req.params;
  
    try {   
      const reviews = await Review.findAll({
        where: { recipient_id: user_id },
        include: [{ model: User, as: 'Reviewer', attributes: ['username','user_id'] }],
      });
  
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };



//Raw Sql Query Impementation

//   const db = require('../models/database');
// const sequelize = db.sequelize; // Use the sequelize instance from database.js
// const Review = db.reviews; // Note: Use the raw SQL query method defined in database.js
// const User = db.users; // Assume User is also required

// exports.addReview = async (req, res) => {
//   const { review, recipient_id } = req.body;
//   const reviewer_id = req.user.user_id; // Assuming you have user authentication implemented

//   try {
//     const getExistingReviewQuery = `
//       SELECT * FROM reviews WHERE recipient_id = ? AND reviewer_id = ?
//     `;
//     const [existingReview] = await sequelize.query(getExistingReviewQuery, {
//       replacements: [recipient_id, reviewer_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (existingReview) {
//       const updateReviewQuery = `
//         UPDATE reviews
//         SET review = ?
//         WHERE recipient_id = ? AND reviewer_id = ?
//       `;
//       await sequelize.query(updateReviewQuery, {
//         replacements: [review, recipient_id, reviewer_id],
//         type: sequelize.QueryTypes.UPDATE
//       });

//       return res.json({ message: 'Review updated successfully', review: { ...existingReview, review } });
//     }

//     const addReviewQuery = `
//       INSERT INTO reviews (reviewer_id, recipient_id, review)
//       VALUES (?, ?, ?)
//     `;
//     await sequelize.query(addReviewQuery, {
//       replacements: [reviewer_id, recipient_id, review],
//       type: sequelize.QueryTypes.INSERT
//     });

//     res.status(201).json({ message: 'Review added successfully', review: { reviewer_id, recipient_id, review } });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getReviewsByRecipient = async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     const getReviewsQuery = `
//       SELECT reviews.*, users.username
//       FROM reviews
//       INNER JOIN users ON reviews.reviewer_id = users.user_id
//       WHERE reviews.recipient_id = ?
//     `;
//     const reviews = await sequelize.query(getReviewsQuery, {
//       replacements: [user_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     res.status(200).json(reviews);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
