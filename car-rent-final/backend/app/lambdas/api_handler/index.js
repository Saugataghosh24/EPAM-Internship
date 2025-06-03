const connectToDatabase = require("./utils/db");
const signUpHandler = require("./handlers/signUp");
const signInHandler = require("./handlers/signIn");

const changePasswordHandler=require("./handlers/changePassword");
const getPersonalInfoHandler=require("./handlers/getPersonalInfo");
const {updatePersonalInfoHandler}=require("./handlers/updatePersonalInfo");

const {getBookingsHandler} = require("./handlers/getAllBookings");
const {createBookingHandler} = require("./handlers/createBooking");
const { getClientBookingsHandler } = require("./handlers/getClientBookings");

const getCarsHandler = require("./handlers/getCars");
const {getCarsFilterHandler} = require("./handlers/getCarsFilter");
const {getCarByIdHandler} = require("./handlers/getCarById");
const getAboutUsHandler = require("./handlers/getAboutUs");
const getFaqHandler = require("./handlers/getFaq");
const getLocationsHandler = require("./handlers/getHomeLocation");
const {getBookedDaysHandler} = require("./handlers/getBookedDays");
const getClientReviewsHandler = require("./handlers/getClientReviews");
const createFeedbackHandler = require("./handlers/createFeedback");
const getRecentFeedbacksHandler = require("./handlers/getRecentFeedbacks");
const getPopularCarsHandler = require("./handlers/getPopularCars");

const {getAllClientsHandler} = require("./handlers/getAllClients");
const {getAllAgentsHandler} = require("./handlers/getAllAgents");
const {getSalesReportsHandler} = require("./handlers/getSalesReport");
const {getAgentsReportHandler} = require("./handlers/getSupportAgentReport")

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

    if(httpMethod === 'GET' && path==="/cars"){
      return await getCarsFilterHandler(event) ;
    }

    if (httpMethod === "GET" && path === "/cars/popular") {
      return await getPopularCarsHandler(event);
    }

    if(httpMethod === 'GET' && path.match(/^\/cars\/[^\/]+$/)){
      return await getCarByIdHandler(event) ;
    }
    
    if (httpMethod === "GET" &&  path.match(/^\/cars\/[^\/]+\/booked-days$/)) {
      return await getBookedDaysHandler(event);
    }

    if (httpMethod === "GET" &&  path.match(/^\/cars\/[^\/]+\/client-review$/)) {
      return await getClientReviewsHandler(event);
    }

    if(httpMethod === 'POST' && path==="/bookings"){
      return await createBookingHandler(event);
    }

    if(httpMethod === 'GET' && path==="/bookings"){
      return await getBookingsHandler(event);
    }

    if(httpMethod === 'GET' && path.match(/^\/bookings\/[^\/]+$/)){
      return await getClientBookingsHandler(event);
    }

    if (httpMethod === "GET" && path === "/home/about-us") {
        return await getAboutUsHandler(event);
    }
    
    if (httpMethod === "GET" && path === "/home/faq") {
        return await getFaqHandler(event);
    }

    if (httpMethod === "GET" && path === "/home/locations") {
        return await getLocationsHandler(event);
    }


    if (httpMethod === "POST" && path === "/feedbacks") {
        return await createFeedbackHandler(event);
    }

    if (httpMethod === "GET" && path === "/feedbacks/recent") {
        return await getRecentFeedbacksHandler(event);
    }

    if (httpMethod === "GET" && path === "/users/clients") {
      return await getAllClientsHandler(event);
    }

    if (httpMethod === "GET" && path === "/users/agents") {
      return await getAllAgentsHandler(event);
    }

    if (httpMethod === "GET" && path === "/reports") {
      return await getSalesReportsHandler(event);
    }

    if (httpMethod === "GET" && path === "/reports/agents") {
      return await getAgentsReportHandler(event);
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
