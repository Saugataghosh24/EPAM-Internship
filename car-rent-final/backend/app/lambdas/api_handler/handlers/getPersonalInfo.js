require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const {response} =require("../utils/response");

module.exports = async function getPersonalInfoHandler(event) {
  const userId = event.pathParameters?.id;

  if (!userId) {
    return response(400, { message: "User ID is required in the path." });
  }

  try {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return response(400, { message: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select(
      "firstName lastName email imageUrl phoneNo address"
    );

    if (!user) {
      return response(404, { message: "User not found." });
    }

    return response(200, {
      clientId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      imageUrl: user.imageUrl || "",
      phoneNumber: user.phoneNo || "",
      street: user.address?.street || "",
      city: user.address?.city || "",
      country: user.address?.country || "",
      postalCode: user.address?.postalCode || ""
    });
  } catch (error) {
    console.error("Error fetching user personal info:", error);
    return response(500, { message: "Internal server error." });
  }
};

