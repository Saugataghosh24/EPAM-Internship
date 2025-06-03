const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
    question: String,
    answer: String
})

module.exports = mongoose.models.Faq || mongoose.model("Faq", faqSchema);