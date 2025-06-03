const User = require("../models/User");
const mongoose=require('mongoose');
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;
const BCRYPT_SALT= parseInt(process.env.BCRYPT_SALT, 10);
const {response} =require("../utils/response");

module.exports = async function changePasswordHandler(event) {

  const { httpMethod, pathParameters } = event;
  const body = JSON.parse(event.body || "{}");
  const { oldPassword, newPassword } = body;
  const userId = pathParameters?.id;

  if (httpMethod !== "PUT") {
    return response(405, { message: "Method Not Allowed" });
  }

  if (!oldPassword || !newPassword || !userId) {
    return response(400, { message: "Missing fields" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response(400, { message: "Invalid user ID format" });
  }
  
  const user = await User.findById(userId);
  if (!user) {
    return response(404, { message: "User not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return response(401, { message: "Old password is incorrect" });
  }

  if (
    !newPassword ||
    newPassword.length < 8 ||
    !/[A-Z]/.test(newPassword) ||     // must contain uppercase
    !/[0-9]/.test(newPassword)       // must contain digit
  ) {
    return response(400, {
      error: "New Password must be at least 8 characters long and include at least one uppercase letter and one digit.",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT);
  user.password = hashedPassword;
  await user.save();

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return response(200, {
    idToken: token,
    role: user.role,
    userId: user.id,
    userImageUrl: user.imageUrl || null,
    username: user.firstName + " " + user.lastName,
  });
};


