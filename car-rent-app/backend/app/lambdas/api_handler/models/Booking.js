const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    carId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    dropOffDateTime: { 
        type: String, 
        required: true 
    },
    dropOffLocationId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
    pickupDateTime: { 
        type: String,
        required: true 
    },
    pickupLocationId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location", 
        required: true
    },
    orderNo:{
        type: String,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ['RESERVED', 'RESERVEDBYSUPPORTAGENT', 'SERVICESTARTED', 'SERVICEPROVIDED','SERVICEFINISHED','CANCELLED'],
        required: true
    },
    carModel:{
        type: String,
        required: true
    },
    carImageUrl:{
        type: String
    },
    review:{
        type: String
    },
    bookedBy:{
        type: String,
    }

}, { timestamps: true });


module.exports = mongoose.model("Booking", bookingSchema);
