// Helper function for responses
const response = (statusCode, body) => {
    return {
      statusCode,
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
          "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    };
  };

  module.exports={response};