const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const {response} =require("../utils/response");

const getRecentFeedbacksHandler = async () => {
  try {
    const feedbacks = await Feedback.find()
  .sort({ date: -1 })
  .limit(10)
  .populate('clientId', 'firstName lastName address') // this includes address
  .populate('carId', 'model images')
  .populate('bookingId', 'orderNo') // optional for orderHistory
  .lean(); // convert Mongoose docs to plain JS objects

const content = feedbacks.map(fb => {
  const client = fb.clientId || {};
  const address = client.address || {};
    console.log(address);
  const author = `${client.firstName || 'User'} ${client.lastName?.[0] || ''}., ${address.city || ''}, ${address.country || ''}`.trim();

  return {
    author,
    carModel: fb.carId?.model || '',
    carImageUrl: fb.carId?.images?.[0] || '',
    date: new Date(fb.date).toLocaleDateString('en-GB'),
    feedbackId: fb._id,
    feedbackText: fb.feedbackText,
    rating: fb.rating.toFixed(1),
    orderNo: fb.bookingId?.orderNo
  };
});

    return response(200,{ content });
    
  } catch (err) {
    console.error('Error fetching recent feedbacks:', err);

    return response(500,{ message: 'Failed to fetch recent feedbacks'});
  
  }
};

module.exports = getRecentFeedbacksHandler;
