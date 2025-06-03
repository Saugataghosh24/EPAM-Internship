const { handler } = require("./index");
require("dotenv").config();

const testEvent = {
  httpMethod: "GET",
  path: "/booking/6810f4607dc500a85709e4ec",
  pathParameters: {
    userid: "6810f4607dc500a85709e4ec" // Extracted manually or by your router
  },
  body: null,
}
const getCarsEvent = {
  httpMethod: "GET",
  path: "/cars",
  pathParameters: null, // Only used if you're accessing something like /cars/{id}
  queryStringParameters: {
        category: 'SUV',
        gearBoxType: 'Manual',
        fuelType: 'Electric',
        minPrice: 100,
        maxPrice: 500,
        page: 1,
        size: 8,
        pickupDateTime: '2024-10-29T10:30:00',
        dropOffDateTime: '2024-10-30T10:30:00'
      
  },
  body: null
};

const postTestEvent= {
    "httpMethod": "POST",
    "path": "/cars/carbooking/6812603f2b17383285bbcc1c",
    "body": "{\"carId\": \"6812603f2b17383285bbcc1c\", \"userId\": \"6810f4607dc500a85709e4ec\", \"dropOffDateTime\": \"2025-06-03 16:00\", \"dropOffLocationId\": \"loc002\", \"pickupDateTime\": \"2025-06-02 10:00\", \"pickupLocationId\": \"loc001\", \"orderNo\": \"ORD-20250429001\", \"bookingStatus\": \"RESERVED\", \"carModel\": \"Hyundai Creta 2023\", \"carImageUrl\": \"https://example.com/images/creta.jpg\", \"review\": \"Smooth ride and clean car!\", \"bookedBy\": \"user123@gmail.com\"}",
    "headers": {
      "Content-Type": "application/json"
    }
}

const putTestEvent = {
  httpMethod: "PUT",
  path: "/users/68121327008084d0edce9a2f/change-password",
  pathParameters: {
    id: "68121327008084d0edce9a2f" // Extracted manually or by your router
  },
  body: JSON.stringify({
    oldPassword: "suv@123Ab",
    newPassword: "Sk@713423"
  }),
  headers: {
    "Content-Type": "application/json"
  }
};


handler(testEvent)
  .then((response) => {
    console.log("Lambda Response:", response);
  })
  .catch((err) => {
    console.error("Lambda Error:", err);
});
