
/**
 * Utility to get all dates between two dates (inclusive)
 */
// const getDatesInRange = (startDate, endDate) => {
//   const dates = [];
//   const current = new Date(startDate);

//   while (current <= endDate) {
//     dates.push(current.toISOString().split('T')[0]); // format as YYYY-MM-DD
//     current.setDate(current.getDate() + 1);
//   }

//   return dates;
// };
const mongoose = require('mongoose');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const {response} =require("../utils/response");
// Helper function for responses
// const response = (statusCode, body) => {
//   return {
//     statusCode,
//     body: JSON.stringify(body)
//   };
// };

// Helper function to get all dates between two dates (inclusive)
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  
  // Create a new date at the start of the day
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);
  
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Format date as YYYY-MM-DD
const formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getBookedDaysHandler = async (event) => {
  try {
    // Extract carId from path parameters
    const { carId } = event.pathParameters;
    
    if (!carId) {
      return response(400, { message: "carId is required" });
    }
    
    // Validate carId format
    const isValidId = (id) => {
      // For MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) return true;
      
    };
    
    if (!isValidId(carId)) {
      return response(400, { message: "Invalid carId format" });
    }
    
    // Find the car to verify it exists and get its bookings
    const car = await Car.findById(carId);
    
    if (!car) {
      return response(404, { message: "Car not found" });
    }
    
    // If car has no bookings, return empty array
    if (!car.carBookings || car.carBookings.length === 0) {
      return response(200, { content: [] });
    }
    
    // Get today's date at the beginning of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    
    // Find all active bookings for this car with future dates
    const bookings = await Booking.find({
      _id: { $in: car.carBookings },
      bookingStatus: { $in: ['RESERVED', 'RESERVEDBYSUPPORTAGENT', 'SERVICESTARTED'] },
      // At least the drop-off date should be in the future
      dropOffDateTime: { $gte: today }
    }).lean();
    
    // If no active future bookings found
    if (bookings.length === 0) {
      return response(200, { content: [] });
    }
    
    // Get all booked dates from all bookings, but only future dates
    const allBookedDates = [];
    
    bookings.forEach(booking => {
      // Properly convert MongoDB date strings to Date objects
      const pickupDateTime = new Date(booking.pickupDateTime);
      const dropOffDateTime = new Date(booking.dropOffDateTime);
      
      // Start from today if the booking started in the past
      let startDate = pickupDateTime < today ? today : pickupDateTime;
      
      // Get all dates in the booking range
      const datesInRange = getDatesInRange(startDate, dropOffDateTime);
      
      allBookedDates.push(...datesInRange);
    });
    
    const futureBookedDates = [...new Set(
      allBookedDates.map(date => formatDateToString(date))
    )];
    
    futureBookedDates.sort();
    

    
    return response(200, { content: futureBookedDates });
    
  } catch (error) {
    console.error('Error fetching car booked days:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message
    });
  }
};

module.exports = { getBookedDaysHandler };