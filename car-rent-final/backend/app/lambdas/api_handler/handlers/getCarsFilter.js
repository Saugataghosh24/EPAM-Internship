const mongoose = require('mongoose');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Location = require('../models/Location');
const { response } = require('../utils/response');

const getCarsFilterHandler = async (event) => {
  // Handle OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    };
  }

  try {
    // Extract query parameters
    const {
      pickupLocationId,
      dropOffLocationId,
      pickupDateTime,
      dropOffDateTime,
      category,
      gearBoxType,
      fuelType,
      minPrice,
      maxPrice,
      page = '1',
      size = '16'
    } = event.queryStringParameters || {};

    // Convert pagination parameters to numbers
    if(page){
        if (isNaN(page) || page <= 0) {
            return response(400, { message: "Page number must be a positive integer" });
        }
    }
    const pageNum = parseInt(page, 10) || 1;
    if(size){
        if (isNaN(size) || size <= 0) {
            return response(400, { message: "Page number must be a positive integer" });
        }
    }
    const pageSize = parseInt(size, 10) || 16;

    const skip = (pageNum - 1) * pageSize;

    if (minPrice && maxPrice) {
        const minPriceNum = parseInt(minPrice, 10);
        const maxPriceNum = parseInt(maxPrice, 10);
        
        if (isNaN(minPriceNum) || isNaN(maxPriceNum)) {
          return response(400, { message: "Price values must be valid numbers" });
        }
        
        if (minPriceNum > maxPriceNum) {
          return response(400, { message: "Maximum price must be greater than or equal to minimum price" });
        }
    }

    // Validate dates
    let pickupDate, dropOffDate;
    let dateFilterNeeded = false;

    if (pickupDateTime) {
      pickupDate = new Date(pickupDateTime);
      if (isNaN(pickupDate.getTime())) {
        return response(400, { message: "Invalid pickup date format" });
      }
      
      // Check if pickup date is in the future or today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pickupDateOnly = new Date(pickupDate);
      pickupDateOnly.setHours(0, 0, 0, 0);
      
      if (pickupDateOnly < today) {
        return response(400, { message: "Pickup date must be today or in the future" });
      }
    }

    if (dropOffDateTime) {
      dropOffDate = new Date(dropOffDateTime);
      if (isNaN(dropOffDate.getTime())) {
        return response(400, { message: "Invalid drop-off date format" });
      }
      
      // If both dates are provided, check that drop-off is after pickup
      if (pickupDate && dropOffDate <= pickupDate) {
        return response(400, { message: "Drop-off date must be after pickup date" });
      }
    }

    if (pickupDateTime && dropOffDateTime) {
        dateFilterNeeded = true;
    }
    // Build the filter object
    const filter = {};

    const isValidId = (id) => {
        // For MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) return true;
    }  
        
    
    // Location filter
    if (pickupLocationId) {
        if (!isValidId(pickupLocationId)) {
            return response(400, { message: "Invalid pickupLocationId format" });
        }
        filter.location = pickupLocationId;
    }

     // Category filter - only add if provided
     const validCategories = ['ECONOMY', 'COMFORT', 'BUSINESS', 'PREMIUM', 'CROSSOVER', 'MINIVAN', 'ELECTRIC'];
     if (category) {
       if (!validCategories.includes(category)) {
         return response(400, { message: 'Invalid category value' });
       }
       filter.carCategory = category;
     }
 
     // Gearbox filter - only add if provided
     const validGearBoxTypes = ['MANUAL', 'AUTOMATIC'];
     if (gearBoxType) {
       if (!validGearBoxTypes.includes(gearBoxType)) {
         return response(400, { message: 'Invalid gearBoxType value' });
       }
       filter.gearBoxType = gearBoxType;
     }
 
     // Fuel type filter - only add if provided
     const validFuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC'];
     if (fuelType) {
       if (!validFuelTypes.includes(fuelType)) {
         return response(400, { message: 'Invalid fuelType value' });
       }
       filter.fuelType = fuelType;
     }
 
    // Price range filter
    if (minPrice || maxPrice) {
        filter.pricePerDay = {};
        if (minPrice) {
          filter.pricePerDay.$gte = parseInt(minPrice, 10);
        }
        if (maxPrice) {
          filter.pricePerDay.$lte = parseInt(maxPrice, 10);
        }
    }

    // Only show available cars
    filter.status = 'AVAILABLE';

    // Parse dates for availability check
    

    // First, get all cars that match the basic filters
    const allMatchingCars = await Car.find(filter).populate('location').lean();

    // If date filtering is needed, filter out cars with booking conflicts
    let availableCars = allMatchingCars;
    
    if (dateFilterNeeded) {
      // Get all car IDs
      const carIds = allMatchingCars.map(car => car._id);
      
      // Find all active bookings for these cars that might conflict
      const activeBookings = await Booking.find({
        carId: { $in: carIds },
        bookingStatus: { $in: ['RESERVED', 'RESERVEDBYSUPPORTAGENT', 'SERVICESTARTED'] }
      }).lean();
      
      // Create a map of car IDs to their bookings
      const carBookingsMap = {};
      activeBookings.forEach(booking => {
        const carId = booking.carId.toString();
        if (!carBookingsMap[carId]) {
          carBookingsMap[carId] = [];
        }
        carBookingsMap[carId].push(booking);
      });
      
      // Filter out cars with booking conflicts
      availableCars = allMatchingCars.filter(car => {
        const carId = car._id.toString();
        const carBookings = carBookingsMap[carId] || [];
        
        // Check if any booking conflicts with the requested dates
        return !carBookings.some(booking => {
            const bookingPickup = new Date(booking.pickupDateTime);
            const bookingDropOff = new Date(booking.dropOffDateTime);
            
            // Set all dates to midnight for date-only comparison
            bookingPickup.setHours(0, 0, 0, 0);
            bookingDropOff.setHours(0, 0, 0, 0);
            
            // Create new Date objects instead of modifying the original ones
            const requestPickup = new Date(pickupDate);
            requestPickup.setHours(0, 0, 0, 0);
            const requestDropOff = new Date(dropOffDate);
            requestDropOff.setHours(0, 0, 0, 0);
            
            // Check for date overlap
            return (
              (requestPickup >= bookingPickup && requestPickup <= bookingDropOff) ||
              (requestDropOff >= bookingPickup && requestDropOff <= bookingDropOff) ||
              (requestPickup <= bookingPickup && requestDropOff >= bookingDropOff)
            );
        });
      });
    }
    
    // Get total count for pagination
    const totalElements = availableCars.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    
    // Apply pagination
    const paginatedCars = availableCars.slice(skip, skip + pageSize);
    
    // Format the response
    const content = paginatedCars.map(car => ({
      carId: car._id.toString(),
      carRating: car.rating ? car.rating.toString() : "0.0",
      imageUrl: car.images && car.images.length > 0 ? car.images[0] : "",
      location: car.location ? `${car.location.locationName || ''}`.trim() : "",
      model: car.model || "",
      pricePerDay: car.pricePerDay ? car.pricePerDay.toString() : "0",
      serviceRating: car.serviceRating ? car.serviceRating.toString() : "0.0",
      status: car.status ? car.status.toUpperCase() : "UNAVAILABLE"
    }));
    
    return response(200, {
      content,
      currentPage: pageNum,
      totalElements,
      totalPages
    });
    
  } catch (error) {
    console.error('Error fetching cars list:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message
    });
  }
};

module.exports = { getCarsFilterHandler };