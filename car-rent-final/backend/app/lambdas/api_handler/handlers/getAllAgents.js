const mongoose = require('mongoose');
const User = require('../models/User');
const { response } = require('../utils/response');

const getAllAgentsHandler = async (event) => {
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
    // Find all users with role 'CLIENT'
    // Assuming your User model has a 'role' field that identifies clients
    const clients = await User.find({ 
      role: 'Support' // Adjust this to match your actual role identifier for clients
    })
    .select('_id firstName lastName') // Only select the fields we need
    .lean(); // Convert to plain JS objects for better performance
    
    if (!clients || clients.length === 0) {
      // Return empty content array if no clients found
      return response(200, { content: [] });
    }
    
    // Format the response according to the API specification
    const content = clients.map(client => ({
      userId: client._id.toString(),
      userName: `${client.firstName || ''} ${client.lastName || ''}`.trim()
    }));
    
    return response(200, { content });
    
  } catch (error) {
    console.error('Error fetching clients:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message
    });
  }
};

module.exports = { getAllAgentsHandler };