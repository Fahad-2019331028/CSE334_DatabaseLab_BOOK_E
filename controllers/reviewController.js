const db=require('../models/database')

const Review = db.reviews;
const User = db.users;
exports.addReview = async (req, res) => {
  console.log("Adding review")
  const { review, recipient_id } = req.body;
  const reviewer_id = req.user.user_id; // Assuming you have user authentication implemented

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
        include: [{ model: User, as: 'Reviewer', attributes: ['username'] }],
      });
  
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };