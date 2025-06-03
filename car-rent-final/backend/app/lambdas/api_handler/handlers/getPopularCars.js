const Car = require('../models/Car');
const mongoose = require('mongoose');
const {response} =require("../utils/response");

const getPopularCarsHandler = async (event) => {
  try {
    const { category } = event.queryStringParameters || {};

    // Optional: Validate category if you have enums defined
    const validCategories = ['ECONOMY', 'COMFORT', 'BUSINESS', 'PREMIUM', 'CROSSOVER', 'MINIVAN', 'ELECTRIC'];
    if (category && !validCategories.includes(category)) {
      return response(400, { message: 'Invalid category value' });
    }

    // Build query conditionally
    const filter = category ? { carCategory: category.toUpperCase() } : {};

    // Query, populate, and sort by number of reviews (assuming `reviews` is an array of ObjectIds)
    const cars = await Car.find(filter)
    .populate('location','locationName')
    .lean();
    cars.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
  


    // Sort in JS by number of reviews (descending)


    // If you store review/rating counts in fields, do it in Mongo query with aggregation

    const content = cars.map(car => ({
      carId: car._id,
      model: car.model,
      imageUrl: car.images?.[0] || '',
      location: car.location?.locationName,    //Shuvam didn't stored location object Id, simply stored the locationId as string, due to which I cant pupulate the location name
      pricePerDay: car.pricePerDay?.toString() || '0',
      carRating: car.carRating?.toFixed(1) || '0.0',
      serviceRating: car.serviceRating?.toFixed(1) || '0.0',
      status: car.status || 'UNKNOWN',
      //category:car.carCategory
    }));

    return response(200, { content });
  } catch (error) {
    console.error('Error fetching popular cars:', error);
    return response(500, { message: 'Failed to fetch popular cars' });
  }
};



module.exports = getPopularCarsHandler;
