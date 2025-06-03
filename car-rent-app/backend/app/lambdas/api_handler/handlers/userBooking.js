const Booking = require("../models/Booking");
const User = require("../models/User");

module.exports = async function getUserBookingsHandler(event) {
  try {
    const userId = event.pathParameters.userid;
    
    const userExists = await User.findById(userId);
    if (!userExists) {
        return response(404, { message: "User not found" });
    }
    const bookings = await Booking.find({ userId });

    if (!bookings.length) {
      return response(404, { message: "No bookings found for this user" });
    }

    return response(200, { bookings });
  } catch (err) {
    return response(500, { message: "Failed to fetch bookings", error: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
