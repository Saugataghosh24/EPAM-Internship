const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

// Helper function for responses
const {response} =require("../utils/response");

const getClientBookingsHandler = async (event) => {
  try {
    // Extract userId from path parameters
    const { userId } = event.pathParameters;
    
    if (!userId) {
      return response(400, { message: "userId is required" });
    }
    
    // Validate userId format
    const isValidId = (id) => {
      // For MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) return true;
    };
    
    if (!isValidId(userId)) {
      return response(400, { message: "Invalid userId format" });
    }
    
    // Find the user to verify they exist
    const user = await User.findById(userId);
    
    if (!user) {
      return response(404, { message: "User not found" });
    }
    
    // Find all bookings for this user
    // If the user has a bookings array, we can use it for more efficient querying
    let bookings;
    
    if (user.bookings && Array.isArray(user.bookings) && user.bookings.length > 0) {
      // If user has a bookings array, use it to fetch bookings
      bookings = await Booking.find({
        _id: { $in: user.bookings }
      }).lean();
    } else {
      // Otherwise, search by userId field in bookings
      bookings = await Booking.find({
        userId: userId
      }).lean();
    }
    
    // If no bookings found
    if (bookings.length === 0) {
      return response(200, { content: [] });
    }
    
    // Get all car IDs from the bookings
    const carIds = [...new Set(bookings.map(booking => booking.carId))];
    
    // Fetch all cars in bulk
    const cars = await Car.find({ _id: { $in: carIds } }).lean();
    
    // Create a lookup map for cars
    const carMap = cars.reduce((map, car) => {
      map[car._id.toString()] = car;
      return map;
    }, {});
    
    // Format the response
    const content = bookings.map(booking => {
      const car = carMap[booking.carId.toString()];
      
      return {
        bookingId: booking._id.toString(),
        bookingStatus: booking.bookingStatus,
        carImageUrl: car && car.images && car.images.length > 0 
          ? car.images[0] 
          : "https://stimg.cardekho.com/images/carexteriorimages/630x420/Tesla/Model-S/5252/1611840999494/exterior-image-164.jpg?tr=w-664",
        carModel: car ? car.model : "Unknown Car",
        orderDetails: booking.orderNo || "N/A"
      };
    });
    
    return response(200, { content });
    
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message
    });
  }
};

module.exports = { getClientBookingsHandler };