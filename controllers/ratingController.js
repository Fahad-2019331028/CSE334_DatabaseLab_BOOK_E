const db=require('../models/database')

const Rating = db.ratings;
const User = db.users;
exports.addRating = async (req, res) => {
  const { rating, recipient_id } = req.body;
  const rater_id = req.user.user_id; // Assuming you have user authentication implemented
  console.log("Adding Ratting")
  try {
    const existingRating = await Rating.findOne({
      where: { recipient_id: recipient_id, rater_id },
    });
    if(rating>10 || rating <0)
        return res.status(400).json({ message: 'The rating is out of bound'});
    if(recipient_id==rater_id)
        return res.status(400).json({ message: 'Cannot be rated'});
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    }
 
    const newRating = await Rating.create({
      rater_id,
      recipient_id: recipient_id,
      rating,
    });
    console.log("Rating added")
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
