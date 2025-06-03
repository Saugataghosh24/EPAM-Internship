const Faq = require('../models/Faq'); // Import your Faq model
const {response} =require("../utils/response");

const getFaqHandler = async (event) => {
  try {

    const content = await Faq.find({}, '-_id question answer'); // Fetch all FAQs, exclude _id

    return response(200,{ content });
    
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return response(500,{ message: 'Failed to fetch FAQs' })
  }
};

module.exports = getFaqHandler;
