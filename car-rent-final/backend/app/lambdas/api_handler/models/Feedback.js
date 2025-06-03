const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    bookingId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required:true
    },
    carId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required:true
    },
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },
    feedbackText:{
        type:String,required:true
    },
    rating:{
        type:Number,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
},)

module.exports = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);