const mongoose = require("mongoose");

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;

  await mongoose.connect(uri, {
    dbName: "carRent"
  });

  isConnected = true;
};

module.exports = connectToDatabase;
