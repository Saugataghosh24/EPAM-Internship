
const Location = require('../models/Location');
const {response} =require("../utils/response");

const getLocationsHandler = async () => {
  try {

    const locations = await Location.find({}, '_id locationName locationAddress locationMapUrl');

    const content = locations.map(loc => ({
        locationId: loc._id.toString(),
        locationName: loc.locationName,
        locationAddress: loc.locationAddress,
        locationMapUrl: loc.locationMapUrl
    }));
    

    return response(200,{ content })  
    
  } catch (error) {
    console.error('Error fetching locations:', error);
    return response(500,{ message: 'Failed to fetch locations' });
  }
};

module.exports = getLocationsHandler;
