const Feedback =require('../models/Feedback');
const Car=require("../models/Car");
const User=require("../models/User");
const Booking=require("../models/Booking");
const mongoose = require('mongoose');

const {response} =require("../utils/response");


const createFeedbackHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const {bookingId, carId, clientId, feedbackText, rating } = data;

    // Validate required fields
    if (!bookingId || !carId || !clientId || !feedbackText || !rating) {
      return response(400,{ message: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return response(400, { message: "Invalid booking ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
        return response(400, { message: "Invalid car ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return response(400, { message: "Invalid client ID format" });
    }

    // Check rating is valid number between 1 and 5
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return response(400, { message: "Rating must be a number between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId)
    const car = await Car.findById(carId)
    const client = await User.findById(clientId)

    //console.log(booking);

    if (!booking ||!car ||!client) {
      return response(404, {message: 'booking or car or client not found'});
    }

    
    const userBookingMatch  = await Booking.findOne({
        _id: new mongoose.Types.ObjectId(String(bookingId)),
        userId : new mongoose.Types.ObjectId(String(clientId))
    });
      
    if (!userBookingMatch ) {
      return response(403,{message: 'Booking ID not associated with this client.'});
    }

    if(booking.bookingStatus !== 'SERVICEPROVIDED'){
      return response(400,{message:"User can give feedback only after service provided"});
    }

    // Create new feedback
    const newFeedback = await Feedback.create({
      bookingId: new mongoose.Types.ObjectId(String(bookingId)),
      carId: new mongoose.Types.ObjectId(String(carId)),
      clientId: new mongoose.Types.ObjectId(String(clientId)),
      feedbackText,
      rating: numericRating,
    });
  
    const updatedCar = await Car.findByIdAndUpdate(
        carId,
        { $push: { review: newFeedback._id } },
        { new: true } // optional: returns updated car
    );

    //Recalculate car rating
    const feedbacks = await Feedback.find({ _id: { $in: updatedCar.review } });
    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    const avgRating = totalRating / feedbacks.length;

    // 4. Update average rating
    await Car.findByIdAndUpdate(carId, {rating: avgRating.toFixed(1), serviceRating :avgRating.toFixed(1)});

    // Add feedback to client reviews array
    await User.findByIdAndUpdate(clientId, {
      $push: { reviews: newFeedback._id }
    });

    booking.bookingStatus='BOOKINGFINISHED';
    booking.review = newFeedback._id;
    booking.save();

    // If booked by support agent, add to their reviews too
    if (
      booking.bookedBy &&
      booking.bookedBy.toString() !== booking.userId.toString()
    ) {
      const supportAgent = await User.findById(booking.bookedBy);
      if (supportAgent && supportAgent.role === 'Support') {
        await User.findByIdAndUpdate(supportAgent._id, {
          $push: { reviews: newFeedback._id }
        });
      }
    }

    return response(201,{feedbackId: newFeedback._id, systemMessage: 'Feedback has been successfully created'})

  } catch (error) {
    console.error('Error creating feedback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create feedback' }),
    };
  }
};

module.exports = createFeedbackHandler;
