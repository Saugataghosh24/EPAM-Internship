require("dotenv").config();
const About = require("../models/About");
const {response} =require("../utils/response");
// Helper function for responses


const getAboutUsHandler = async (event) => {
    try {
      const content = await About.find({}, '-_id title description numericValue'); // exclude _id
      return response(200, {content});
    } catch (error) {
      console.error('Error fetching About Us data:', error);
      return response(500,{ message: 'Failed to fetch About Us data' });
    }
  };
  
module.exports = getAboutUsHandler;