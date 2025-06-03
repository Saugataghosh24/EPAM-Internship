require("dotenv").config();
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const mongoose = require("mongoose");


module.exports = async function bookingsHandler(event) {
    try {
        const data = JSON.parse(event.body);

        const carId = data.carId;
        const pickup = new Date(data.pickupDateTime);
        const dropoff = new Date(data.dropOffDateTime);

        const now = new Date();
        if (pickup < now || dropoff < now) {
            return response(400, { message: "Pickup and drop-off dates must be in the future" });
        }

        if (dropoff <= pickup) {
            return response(400, { message: "Drop-off time must be after pickup time" });
        }

        const carExists = await Car.findById(carId);
        if (!carExists) {
            return response(404, { message: "Car not found with the given ID" });
        }

        const overlappingBooking = await Booking.findOne({
            carId: new mongoose.Types.ObjectId(carId),
            $or: [
                {
                    pickupDateTime: { $lt: data.dropOffDateTime },
                    dropOffDateTime: { $gt: data.pickupDateTime }
                }
            ]
        });

        if (overlappingBooking) {
            return response(409, { message: "Car is already booked in the selected time range" });
        }

        const booking = new Booking({
            ...data,
            carImageUrl: data.carImageUrl || "",
            review: data.review || "",
            bookedBy: data.bookedBy || "",
        });

        const saved = await booking.save();

        return response(201, { message: "Booking created", booking: saved });
    } catch (err) {
        return response(500, { message: "Error saving booking", error: err.message });
    }
};

function response(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}
