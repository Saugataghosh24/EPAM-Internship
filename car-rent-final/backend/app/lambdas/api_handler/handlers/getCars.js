const mongoose = require('mongoose');
const Car = require('../models/Car'); // Adjust path as needed
const Location = require('../models/Location'); // Adjust path as needed

module.exports =async function getCarsHandler(event) {
  try {
    // Extract query parameters from event
    const queryParams = event.queryStringParameters || {};
    const {
      pickupLocationId,
      category,
      gearBoxType,
      fuelType,
      minPrice,
      maxPrice,
      page = '1',
      size = '10',
      pickupDateTime,
      dropOffDateTime
    } = queryParams;

    // console.log("Received query parameters:", queryParams);
    
    // Build filter object
    const filter = {};

    // Add category filter if provided
    if (category) {
      filter.carCategory = category;
    }

    // Add gearbox type filter if provided
    if (gearBoxType) {
      filter.gearBoxType = gearBoxType;
    }

    // Add fuel type filter if provided
    if (fuelType) {
      filter.fuelType = fuelType;
    }

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseInt(maxPrice);
    }

    // Filter for available cars during the requested time period
    if (pickupDateTime && dropOffDateTime) {
      const pickupDate = new Date(pickupDateTime);
      const dropOffDate = new Date(dropOffDateTime);

      // Filter out cars that are booked during the requested period
      filter.$or = [
        { booked: { $size: 0 } }, // Cars with no bookings
        {
          booked: {
            $not: {
              $elemMatch: {
                $or: [
                  // Booking overlaps with requested period
                  { bookedFrom: { $lte: dropOffDate }, bookedTo: { $gte: pickupDate } }
                ]
              }
            }
          }
        }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page || '1');
    const sizeNum = parseInt(size || '10');
    const skip = (pageNum - 1) * sizeNum;
    const limit = sizeNum;

    // Get all cars first, then filter by location ID manually
    let query = Car.find(filter).populate('location');
    
    // Execute the query
    let cars = await query.lean();
    
    // If pickupLocationId is provided, filter manually after fetching
    if (pickupLocationId) {
      // console.log(`Manually filtering for location ID: ${pickupLocationId}`);
      cars = cars.filter(car => {
        const carLocationId = car.location && car.location._id ? 
          car.location._id.toString() : 
          (car.location ? car.location.toString() : null);
        
        // console.log(`Car ${car.model} has location ID: ${carLocationId}`);
        return carLocationId === pickupLocationId;
      });
      // console.log(`After manual filtering: ${cars.length} cars match location ID`);
    }
    
    // Apply pagination after filtering
    const totalElements = cars.length;
    cars = cars.slice(skip, skip + limit);

    const totalPages = Math.ceil(totalElements / limit);

    // Format response
    const formattedCars = cars.map(car => ({
      carId: car._id.toString(),
      carRating: car.rating?.toString() || "0",
      imageUrl: car.images && car.images.length > 0 ? car.images[0] : "",
      location: car.location && typeof car.location === 'object' ? 
        car.location.locationAddress || "" : "",
      model: car.model,
      pricePerDay: car.pricePerDay?.toString() || "0",
      serviceRating: car.serviceRating?.toString() || "0",
      status: car.status?.toUpperCase() || "UNAVAILABLE"
    }));

    // Return formatted response for AWS Lambda
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For CORS support
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        content: formattedCars,
        currentPage: pageNum,
        totalElements,
        totalPages
      })
    };
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
}