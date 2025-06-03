const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    locationName: String,
    locationAddress: String,
    locationMapUrl: String
})

module.exports = mongoose.models.Location || mongoose.model("Location", locationSchema);