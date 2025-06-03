const { handler } = require("./index");
require("dotenv").config();

const testEvent = {
  httpMethod: "GET",
  path: "/cars/6812603f2b17383285bbcc1c/booked-days",
  pathParameters: {
    carId: "6812603f2b17383285bbcc1c" // Extracted manually or by your router
  },
  body: null,
}

const postTestEvent= {
    "httpMethod": "POST",
    "path": "/cars/carbooking/6812603f2b17383285bbcc1c",
    "body": "{\"carId\": \"6812603f2b17383285bbcc1c\", \"userId\": \"6810f4607dc500a85709e4ec\", \"dropOffDateTime\": \"2025-06-03 16:00\", \"dropOffLocationId\": \"loc002\", \"pickupDateTime\": \"2025-06-02 10:00\", \"pickupLocationId\": \"loc001\", \"orderNo\": \"ORD-20250429001\", \"bookingStatus\": \"RESERVED\", \"carModel\": \"Hyundai Creta 2023\", \"carImageUrl\": \"https://example.com/images/creta.jpg\", \"review\": \"Smooth ride and clean car!\", \"bookedBy\": \"user123@gmail.com\"}",
    "headers": {
      "Content-Type": "application/json"
    }
}

const putChangePasswordEvent = {
  httpMethod: "PUT",
  path: "/users/681852160c45f657b2ce8aeb/change-password",
  pathParameters: {
    id: "681852160c45f657b2ce8aeb" // Extracted manually or by your router
  },
  body: JSON.stringify({
    oldPassword: "Strong@123",
    newPassword: "Stronger@123"
  }),
  headers: {
    "Content-Type": "application/json"
  }
};

const postSignUpEvent= {
  "httpMethod": "POST",
  "path": "/auth/sign-up",
  "body": "{\"email\": \"chngpass5@GMAIL.com\", \"password\": \"Strong@123\", \"firstName\": \"Change\", \"lastName\": \"password\"}",
  "headers": {
    "Content-Type": "application/json"
  }
}

const postSignInEvent= {
  "httpMethod": "POST",
  "path": "/auth/sign-in",
  "body": "{\"email\": \"chngpass5@GMAIL.com\", \"password\": \"Strong@123\"}",
  "headers": {
    "Content-Type": "application/json"
  }
}

const postCreateFeedbackEvent= {
  "httpMethod": "POST",
  "path": "/feedbacks",
  "body": "{\"bookingId\":\"6818a68a3b58b3f5b434f7c2\", \"carId\": \"6812603f2b17383285bbcc1c\", \"clientId\": \"6810f4607dc500a85709e4ec\", \"feedbackText\": \"Feedback testing2, not so good car\",\"rating\": \"3.9\"}",
  "headers": {
    "Content-Type": "application/json"
  }
}

const getClientReviewEvent = {
  httpMethod: "GET",
  path: "/cars/6812603f2b17383285bbcc1c/client-reviews",
  pathParameters: {
    carId: "6812603f2b17383285bbcc1c" // Extracted manually or by your router
  },
  body: null,
}

const getRecentFeedbackEvent = {
  httpMethod: "GET",
  path: "/feedbacks/recent",
  body: null,
}

const getPopularCarsEvent = {
  httpMethod: "GET",
  queryStringParameters: {
    
  },
  path: "/cars/popular",
  body: null,
}

const postCreateBookingEvent = {
  httpMethod: "POST",
  path: "/bookings",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    carId: "681e747b047d13460be88dfd",
    clientId: "681e77b48676132d30be0742",
    dropOffDateTime: "2025-05-24 10:00",
    dropOffLocationId: "681311073b58b3f5b434f78b",
    pickupDateTime: "2025-05-21 10:00",
    pickupLocationId: "681311073b58b3f5b434f78b"
  }),
  isBase64Encoded: false
};


const getAllBookingsEvent = {
  httpMethod: "GET",
  queryStringParameters: {
    dateFrom: '2025-05-10 12:00',
    dateTo: '2025-05-10 12:30'
  },
  path: "/bookings",
  body: null,
}

const getClientBookingsEvent = {
  httpMethod: "GET",
  path: "/bookings/6810f4607dc500a85709e4ec",
  pathParameters: {
    userId: "6810f4607dc500a85709e4ec" // Extracted manually or by your router
  },
  body: null,
}

const getBookedDaysEvent = {
  httpMethod: "GET",
  path: "/cars/681e747b047d13460be88dfd/booked-days",
  pathParameters: {
    carId: "681e747b047d13460be88dfd" // Extracted manually or by your router
  },
  body: null,
}

const getCarsByIdEvent = {
  httpMethod: "GET",
  path: "/cars/6812603f2b17383285bbcc1c",
  pathParameters:{
    carId:'6812603f2b17383285bbcc1c'
  },
  body:null
}  
const getCarsFilterEvent = {
  httpMethod: "GET",
  path: "/cars",
  pathParameters: null, // Only used if you're accessing something like /cars/{id}
  queryStringParameters: {
        // category: 'COMFORT',
        // gearBoxType: 'MANUAL',
        // fuelType: 'ELECTRIC',
        // pickupLocationId: '681311073b58b3f5b434f78b',
        // minPrice: "0",
        // maxPrice: "1000",
        // page: 1,
        // size: 16,
        // pickupDateTime: '2025-05-19T10:30:00',
        // dropOffDateTime: '2025-05-20T10:30:00'
      
  },
  body: null
};

const getAllClientsEvent = {
  httpMethod: "GET",
  path: "/users/clients",
  body:null
}  

const getSalesReportEvent = {
  httpMethod: "GET",
  queryStringParameters:{
    dateFrom:"2025-05-05",
    dateTo:"2025-05-11"
  },
  path: "/reports",
  body:null
}  
const getAgentsReportEvent = {
  httpMethod: "GET",
  queryStringParameters:{
     dateFrom:"2025-06-21",
    dateTo:"2025-07-02"
  },
  path: "/reports/agents",
  body:null
}  
handler(getAgentsReportEvent)
  .then((response) => {
    console.log("Lambda Response:", response);
  })
  .catch((err) => {
    console.error("Lambda Error:", err);
});
