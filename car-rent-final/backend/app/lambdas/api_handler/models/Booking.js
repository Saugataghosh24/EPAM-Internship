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
        type: Date, 
        required: true 
    },
    dropOffLocationId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
    pickupDateTime: { 
        type: Date,
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
        enum: ['RESERVED', 'RESERVEDBYSUPPORTAGENT', 'SERVICESTARTED', 'SERVICEPROVIDED','BOOKINGFINISHED','CANCELLED'],
        required: true
    },
    review:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback"
    },
    bookedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    startMilage: Number,
    endMilage: Number,
    bookingDate:{
        type:Date,
        default: Date.now
    },
    revenue: Number

}, { timestamps: true });


module.exports = mongoose.models.Booking||mongoose.model("Booking", bookingSchema);
