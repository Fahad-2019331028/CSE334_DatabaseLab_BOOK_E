const db=require('../models/database')
const { Op } = require('sequelize');
const Rating = db.ratings;
const User = db.users;
const Order = db.orders; 
exports.addRating = async (req, res) => {
  const { rating, recipient_id } = req.body;
  const rater_id = req.user.user_id; // Assuming you have user authentication implemented
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
    
    // Fetch orders where rater is either the buyer or the seller
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
