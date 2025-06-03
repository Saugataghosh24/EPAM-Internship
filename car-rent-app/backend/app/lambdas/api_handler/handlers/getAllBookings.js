require("dotenv").config();
const Booking = require("../models/Booking");


module.exports = async function getbookingsHandler(event) {
    try {
        const bookings = await Booking.find();
        return response(200, { bookings });
    } catch (err) {
        return response(500, { message: 'Error fetching bookings', error: err.message });
    }
};

function response(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}
