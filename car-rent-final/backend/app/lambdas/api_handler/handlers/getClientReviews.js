const Feedback = require('../models/Feedback');
const User = require('../models/User'); // Ensure this exists and exports the user model
const mongoose=require('mongoose');
const {response} =require("../utils/response");

const getClientReviewsHandler = async (event) => {
  const { carId } = event.pathParameters;
  const {
    page = 0,
    size = 5,
    sort = 'DATE',
    direction = 'DESC',
  } = event.queryStringParameters || {};

  const sortFieldMap = {
    DATE: 'date',
    RATING: 'rating',
  };

  const sortField = sortFieldMap[sort.toUpperCase()] || 'date';
  const sortOrder = direction.toUpperCase() === 'ASC' ? 1 : -1;

  try {
    const totalReviews = await Feedback.countDocuments({ carId });

    const feedbacks = await Feedback.find({ carId })
      .populate('clientId', 'firstName lastName imageUrl') // assumes User model has fullName & imageUrl
      .sort({ [sortField]: sortOrder })
      .skip(parseInt(page) * parseInt(size))
      .limit(parseInt(size));

    const content = feedbacks.map((review) => ({
      author: review.clientId?.firstName + " "+ review.clientId?.firstName[0]+"." || 'Anonymous',
      authorImageUrl: review.clientId?.imageUrl || '',
      date: new Date(review.date).toLocaleDateString('en-GB'), // DD.MM.YYYY
      rentalExperience: review.rating,
      text: review.feedbackText,
    }));

    return response ( 200, {
      content,
      currentPage: parseInt(page),
      totalElements: totalReviews,
      totalPages: Math.ceil(totalReviews / size),
    })
  } catch (error) {
    console.error('Error fetching client reviews:', error);

    return response(500,{ message: 'Failed to fetch client reviews' })
  }
};

module.exports = getClientReviewsHandler;
