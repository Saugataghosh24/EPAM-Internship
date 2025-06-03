require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT, 10);
const {response} =require("../utils/response");

module.exports = async function signUpHandler(event) {
  const body = JSON.parse(event.body || "{}");
  let email = (body.email || "").toLowerCase();
  const { password, firstName, lastName } = body;

  console.log(email);

  // Validation
  if (!body || Object.keys(body).length === 0 || 
    !body.email || !body.password || !body.firstName)
  return response(400, { error: "email, password, firstName fields are required" });

  if (!firstName || !/^[a-zA-Z']{2,}$/.test(firstName)) {
    return response(400, { error: "First name must be at least 2 letters and contain only alphabets" });
  }

  if (lastName && !/^[a-zA-Z']+$/.test(lastName)) {
    return response(400, { error: "Last name must contain only alphabets" });
  }

  const emailRegex = /^[a-zA-Z][a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]*(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/;
  if (!email || !emailRegex.test(email)) {
    return response(400, { error: "Invalid email format" });
  }

  if (
    !password ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||     // must contain uppercase
    !/[0-9]/.test(password)       // must contain digit
  ) {
    return response(400, {
      error: "Password must be at least 8 characters long and contain at least one uppercase letter and one digit",
    });
  }

  
  // Check for existing user
  const existingUser = await User.findOne({ email});
  if (existingUser) {
    return response(409, { error: "Email already exists" });
  }

  // Save new user
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT);
  const newUser = new User({ email, firstName, lastName, password: hashedPassword });
  await newUser.save();

  return response(201, { message: "User successfully created" });
};


