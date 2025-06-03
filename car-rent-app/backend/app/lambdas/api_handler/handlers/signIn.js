require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;


module.exports = async function signInHandler(event) {

  const body = JSON.parse(event.body || "{}");
  const { email, password } = body;

  if (!email || !password) {
    return response(400, { message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return response(400, { message: "Invalid username/password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return response(400, { message: "Invalid username/password" });
  }

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

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
