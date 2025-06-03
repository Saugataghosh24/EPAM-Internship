const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Client', 'Support', 'Admin'],
        default: 'Client'
    },
    imageUrl: String,
    phoneNo: Number,
    address: {
        street: String,
        city: String,
        country: String,
        postalCode: Number
    },
    passport: {
        front: String,
        back: String
    },
    drivingLicense: {
        front: String,
        back: String
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback"
    }],
    registeredOn: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });


module.exports = mongoose.models.User || mongoose.model("User", userSchema);