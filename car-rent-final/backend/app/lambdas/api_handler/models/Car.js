const mongoose = require("mongoose");
const carSchema = new mongoose.Schema({
    model: String,
    rating: Number,
    carCategory: String,
    gearBoxType: String,
    fuelType: String,
    engineCapacity: String,
    fuelConsumption: String,
    milage:{
        type: Number, 
    }, 
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
        enum: ['AVAILABLE', 'BOOKED', 'UNAVAILABLE'],
    },
    passengerCapacity: Number,
    carBookings: [{
        type : mongoose.Schema.Types.ObjectId,
        ref:"Booking"
    }],
    climateControlOptions: String,
    serviceRating: Number,
    review:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback"
    }],
    registrationNumber: String

});

module.exports = mongoose.models.Car || mongoose.model("Car", carSchema);
