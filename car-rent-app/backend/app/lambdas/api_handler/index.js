const connectToDatabase = require("./utils/db");
const signUpHandler = require("./handlers/signUp");
const signInHandler = require("./handlers/signIn");
const changePasswordHandler=require("./handlers/changePassword");
const getPersonalInfoHandler=require("./handlers/getPersonalInfo");
// const updatePersonalInfoHandler=require("./handlers/updatePersonalInfo");
const bookingHandler = require("./handlers/bookings");
const getbookingsHandler = require("./handlers/getAllBookings");
const userBooking = require('../api_handler/handlers/userBooking');
const getCarsHandler = require("./handlers/getCars");


exports.handler = async (event) => {
  try {
    await connectToDatabase();

    const { httpMethod, path } = event;
    

    if (httpMethod === "POST" && path === "/auth/sign-up") {
      return await signUpHandler(event);
    }

    if (httpMethod === "POST" && path === "/auth/sign-in") {
      return await signInHandler(event);
    }

    if (httpMethod === 'PUT' && path.match(/^\/users\/[^\/]+\/change-password$/)) {
        return await changePasswordHandler(event);
    }

    if (httpMethod === 'GET' && path.match(/^\/users\/[^\/]+\/personal-info$/)) {
        return await getPersonalInfoHandler(event);
    }
    
    if (httpMethod === 'PUT' && path.match(/^\/users\/[^\/]+\/personal-info$/)) {
        return await updatePersonalInfoHandler(event);
    }

    if(httpMethod === 'POST' && path.match(/^\/cars\/carbooking\/[^\/]+$/)){
      return await bookingHandler(event);
    }

    if(httpMethod === 'GET' && path==="/bookings"){
      return await getbookingsHandler(event);
    }
    if(httpMethod === 'GET' && path==="/cars"){
      return await getCarsHandler(event) ;
    }
    if(httpMethod === 'GET' && path.match(/^\/booking\/[^\/]+$/)){
      return await userBooking(event);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Route not found" }),
    };
  } catch (err) {
    console.error("Auth error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
