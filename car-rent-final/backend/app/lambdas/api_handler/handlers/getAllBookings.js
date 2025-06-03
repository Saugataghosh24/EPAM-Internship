const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Car = require('../models/Car');
const Location = require('../models/Location');
const {response} =require("../utils/response");


// Helper function to format dates for the response
const formatDateForMessage = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Helper function to format date for display
const formatDateDisplay = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

const getBookingsHandler = async (event) => {
  try {
    // Get query parameters
    const { dateFrom, dateTo, clientId } = event.queryStringParameters || {};
    
    // Build query object
    const query = {};
    
    // Handle date filters with more flexibility
    if (dateFrom || dateTo) {
      // If either date is provided, we'll create a date filter
      
      if (dateFrom) {
        try {
          const fromDate = new Date(dateFrom);
          if (!isNaN(fromDate.getTime())) {
            // If only dateFrom is provided without dateTo, 
            // find bookings from this date onwards
            query.bookingDate = query.bookingDate || {};
            query.bookingDate.$gte = fromDate;
          } else {
            return response(400, { 
              message: "Invalid dateFrom format. Expected format: YYYY-MM-DD HH:MM",
              providedValue: dateFrom
            });
          }
        } catch (error) {
          return response(400, { 
            message: "Error parsing dateFrom",
            providedValue: dateFrom,
            error: error.message
          });
        }
      }
      
      if (dateTo) {
        try {
          const toDate = new Date(dateTo);
          if (!isNaN(toDate.getTime())) {
            // If only dateTo is provided without dateFrom,
            // find bookings up to this date
            query.bookingDate = query.bookingDate || {};
            query.bookingDate.$lte = toDate;
          } else {
            return response(400, { 
              message: "Invalid dateTo format. Expected format: YYYY-MM-DD HH:MM",
              providedValue: dateTo
            });
          }
        } catch (error) {
          return response(400, { 
            message: "Error parsing dateTo",
            providedValue: dateTo,
            error: error.message
          });
        }
      }
    }
    

    const isValidId = (id) => {
          // For MongoDB ObjectId
          if (mongoose.Types.ObjectId.isValid(id)) return true;
    }  
        
        
        
    // Add client filter if provided
    if (clientId) {
        if (!isValidId(clientId)) {
            return response(400, { message: "Invalid carId format" });
        }
        // Validate clientId format if needed
        query.userId = clientId;
    }
    
    console.log("Query filters:", JSON.stringify(query, null, 2));
    
    // Fetch bookings with the applied filters
    const bookings = await Booking.find(query)
      .sort({ bookingDate: 1 }) // Sort by pickup date ascending
      .lean(); // Convert to plain JS objects for better performance
    
    console.log(`Found ${bookings.length} bookings matching the criteria`);
    
    // If no bookings found
    if (bookings.length === 0) {
      return response(200, { content: [] });
    }
    
    // Get all unique car IDs, user IDs, and location IDs from the bookings
    const carIds = [...new Set(bookings.map(booking => booking.carId))];
    const userIds = [...new Set([
      ...bookings.map(booking => booking.userId),
      ...bookings.filter(booking => booking.bookedBy).map(booking => booking.bookedBy)
    ])];
    const locationIds = [...new Set([
      ...bookings.map(booking => booking.pickupLocationId),
      ...bookings.map(booking => booking.dropOffLocationId)
    ])];
    
    // Fetch all cars, users, and locations in bulk (more efficient than individual queries)
    const [cars, users, locations] = await Promise.all([
      Car.find({ _id: { $in: carIds } }).lean(),
      User.find({ _id: { $in: userIds } }).lean(),
      Location.find({ _id: { $in: locationIds } }).lean()
    ]);
    
    // Create lookup maps for efficient access
    const carMap = cars.reduce((map, car) => {
      map[car._id.toString()] = car;
      return map;
    }, {});
    
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});
    
    const locationMap = locations.reduce((map, location) => {
      map[location._id.toString()] = location;
      return map;
    }, {});
    
    // Format the response
    const content = bookings.map(booking => {
      const car = carMap[booking.carId.toString()];
      const user = userMap[booking.userId.toString()];
      const pickupLocation = locationMap[booking.pickupLocationId.toString()];
      
      const pickupDate = new Date(booking.pickupDateTime);
      const dropOffDate = new Date(booking.dropOffDateTime);
      
      // Determine who made the booking
      let madeBy = "Support Agent"; // Default
      if (booking.bookedBy) {
        const bookedById = booking.bookedBy.toString();
        madeBy = bookedById === booking.userId.toString() ? "Client" : "Support Agent";
      }
      
      // Extract order number from the format "0001 (01.01.24)"
      const bookingNumber = booking.orderNo ? booking.orderNo.split(" ")[0] : "N/A";
      
      return {
        bookingId: booking._id.toString(),
        bookingNumber,
        BookingPeriod: `${formatDateForMessage(pickupDate)} - ${formatDateForMessage(dropOffDate)}`,
        carModel: car ? car.model : "Unknown Car",
        clientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Unknown Client",
        date: formatDateDisplay(booking.bookingDate),
        location: pickupLocation ? pickupLocation.locationName : "Unknown Location",
        madeBy
      };
    });
    
    return response(200, { content });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message
    });
  }
};

module.exports = { getBookingsHandler };
