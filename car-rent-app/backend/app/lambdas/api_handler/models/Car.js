const mongoose = require("mongoose");
const carSchema = new mongoose.Schema({
    model: String,
    rating: Number,
    carCategory: String,
    gearBoxType: String,
    fuelType: String,
    engineCapacity: String,
    fuelConsumption: String,
    images: [{
        type: String
    }],
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location"
    },
    pricePerDay: Number,
    status: {
        type: String,
        enum: ['Available', 'Booked', 'Unavailable'],
    },
    passengerCapacity: Number,
    booked: [{
        bookedFrom: { type: Date, required: true },
        bookedTo: { type: Date, required: true }
    }],
    climateControlOptions: String,
    serviceRating: Number,
    review:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback"
    }]

});

module.exports = mongoose.models.Car || mongoose.model("Car", carSchema);
