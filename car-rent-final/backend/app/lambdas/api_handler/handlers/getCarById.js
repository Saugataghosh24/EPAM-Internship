const mongoose = require('mongoose');
const Car = require('../models/Car');
const Location = require('../models/Location');
const { response } = require('../utils/response');

const getCarByIdHandler = async (event) => {
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
    
    // Find the car and populate its location
    const car = await Car.findById(carId).populate('location');
    
    if (!car) {
      return response(404, { message: "Car not found" });
    }
    
    // Format the response according to the API specification
    const formattedResponse = {
      carId: car._id.toString(),
      carRating: car.rating ? car.rating.toString() : "0.0",
      climateControlOption: car.climateControlOptions || "NONE",
      engineCapacity: car.engineCapacity || "",
      fuelConsumption: car.fuelConsumption || "",
      fuelType: car.fuelType || "",
      gearBoxType: car.gearBoxType || "",
      images: car.images || [],
      location: car.location ? `${car.location.locationName}`.trim() : "",
      model: car.model || "",
      passengerCapacity: car.passengerCapacity ? car.passengerCapacity.toString() : "0",
      pricePerDay: car.pricePerDay ? car.pricePerDay.toString() : "0",
      serviceRating: car.serviceRating ? car.serviceRating.toString() : "0.0",
      status: car.status ? car.status.toUpperCase() : "UNAVAILABLE",
    };
    
    return response(200, formattedResponse);
    
  } catch (error) {
    console.error('Error fetching car by ID:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message
    });
  }
};

module.exports = { getCarByIdHandler };