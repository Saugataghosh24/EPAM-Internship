const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
    title: String,
    description: String,
    numericValue: Number
})

module.exports = mongoose.models.About || mongoose.model("About", aboutSchema);