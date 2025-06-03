const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Counter = require('../models/Counter');
const User = require('../models/User');
const {response} =require("../utils/response");
// Helper function for responses


async function getOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'booking' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value.toString().padStart(4, '0');
}

const getFormattedDate = () => {
    // Create base date
    const now = new Date();
    
    // Add 5 hours and 30 minutes to adjust for timezone
    const adjustedDate = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
    
    // Format the adjusted date
    const yy = adjustedDate.getFullYear().toString().slice(-2);
    const mm = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(adjustedDate.getDate()).padStart(2, '0');
    
    return `(${dd}.${mm}.${yy})`;
  };

// Helper function to format dates for the response message
const formatDateForMessage = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Helper function to format time for the response message
const formatTimeForMessage = (date) => {
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${ampm}`;
};


const calculateDays = (startDate, endDate) => {
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1;
};


const createBookingHandler = async (event) => {
  try {
    // Parse the incoming request
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      return response(400, { message: "Invalid JSON in request body" });
    }

    // Validate required fields
    const { carId, clientId, dropOffDateTime, pickupDateTime, dropOffLocationId, pickupLocationId, supportAgentId } = requestBody;
    
    // Check if all required fields are present
    if (!carId || !clientId || !dropOffDateTime || !pickupDateTime || !dropOffLocationId || !pickupLocationId) {
      return response(400, { 
        message: "Missing required fields",
        requiredFields: {
          carId: !!carId,
          clientId: !!clientId,
          dropOffDateTime: !!dropOffDateTime,
          pickupDateTime: !!pickupDateTime,
          dropOffLocationId: !!dropOffLocationId,
          pickupLocationId: !!pickupLocationId
        }
      });
    }

    // Validate MongoDB ObjectId format or UUID format depending on your system
    // Note: If using UUIDs instead of MongoDB ObjectIds, adjust validation accordingly
    const isValidId = (id) => {
      // For MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) return true;
    }  
    
    if (!isValidId(carId)) {
      return response(400, { message: "Invalid carId format" });
    }
    
    if (!isValidId(clientId)) {
      return response(400, { message: "Invalid clientId format" });
    }
    
    if (!isValidId(dropOffLocationId)) {
      return response(400, { message: "Invalid dropOffLocationId format" });
    }
    
    if (!isValidId(pickupLocationId)) {
      return response(400, { message: "Invalid pickupLocationId format" });
    }

    let agent;
    if(supportAgentId){
      if (!isValidId(supportAgentId)) {
        return response(400, { message: "Invalid supportAgentId format"});
      }
      agent = await User.findById(supportAgentId);
      if (!agent || !agent.role==='Support') {
      return response(404, { message: 'Support Agent not found' });
      }
    }

    // Parse dates - handle the format "2024-06-08 10:00"
    const pickupDate = new Date(pickupDateTime);
    const dropOffDate = new Date(dropOffDateTime);
  
    
    if (isNaN(pickupDate.getTime())) {
      return response(400, { message: "Invalid pickupDateTime format. Expected format: YYYY-MM-DD HH:MM" });
    }
    
    if (isNaN(dropOffDate.getTime())) {
      return response(400, { message: "Invalid dropOffDateTime format. Expected format: YYYY-MM-DD HH:MM" });
    }

    // Validate date logic
    const now = new Date();
    if (pickupDate <= now) {
      return response(400, { message: "Pickup date must be in the future" });
    }

    if (dropOffDate < now) {
      return response(400, { message: "Drop-off date must be in the future" });
    }

    if (dropOffDate <= pickupDate) {
      return response(400, { message: "Drop-off time must be after pickup time" });
    }

    // Check if the car exists
    const car = await Car.findById(carId);
    if (!car) {
      return response(404, { message: 'Car not found' });
    }

    const user = await User.findById(clientId);
    if (!user) {
      return response(404, { message: 'User not found' });
    }

    if (car.location && car.location.toString() !== pickupLocationId.toString()) {
        return response(400, { 
          message: 'The selected car is not available at the requested pickup location',
          carLocation: car.location,
          requestedLocation: pickupLocationId
        });
    }

    // Check for conflicting bookings
    const bookings = await Booking.find({
      _id: { $in: car.carBookings },
      bookingStatus: { $in: ['RESERVED', 'RESERVEDBYSUPPORTAGENT', 'SERVICESTARTED'] }
    });
    
    const conflictingBooking = bookings.some(booking => {
      const existingPickupDate = new Date(booking.pickupDateTime);
      const existingDropOffDate = new Date(booking.dropOffDateTime);

      return (pickupDate >= existingPickupDate && pickupDate <= existingDropOffDate) ||
             (dropOffDate > existingPickupDate && dropOffDate <= existingDropOffDate) ||
             (pickupDate <= existingPickupDate && dropOffDate >= existingDropOffDate);
    });

    if (conflictingBooking) {
      return response(400, { message: 'The selected booking dates conflict with an existing booking' });
    }

        // Create booking
        const serial = await getOrderNumber();
        const datePart = getFormattedDate();
        const orderNo = "#" + serial + " " + datePart;
        const pricePerDay= car.pricePerDay || 100;
        const totalPrice= calculateDays(pickupDate,dropOffDate) * pricePerDay ;
        const endMilage = car.milage + calculateDays(pickupDate,dropOffDate)*100; 
    
        
    
        const newBooking = new Booking({
          carId,
          userId: clientId,
          dropOffDateTime: dropOffDate,
          pickupDateTime: pickupDate,
          dropOffLocationId,
          pickupLocationId,
          orderNo,
          bookingStatus: agent?'RESERVEDBYSUPPORTAGENT':'RESERVED',
          bookedBy: agent ? supportAgentId : clientId,
          startMilage: car.milage,
          endMilage:endMilage,
          revenue:totalPrice,
          bookingDate: new Date()
        });
    
        await newBooking.save();
    
        // Update car's bookings array
        car.milage = endMilage;
        car.carBookings.push(newBooking._id);
        await car.save();
    
        //Update user's booking array
        user.bookings.push(newBooking._id);
        await user.save();
    
        if(agent){
          agent.bookings.push(newBooking._id);
          await agent.save();
        }

    // Calculate the cancellation deadline (day before pickup at 10:30 PM)
    const cancellationDeadline = new Date(pickupDate);
    cancellationDeadline.setDate(cancellationDeadline.getDate() - 1);
    cancellationDeadline.setHours(22, 30, 0, 0);

    // Format the response message according to the specification
    const pickupDateFormatted = formatDateForMessage(pickupDate);
    const dropOffDateFormatted = formatDateForMessage(dropOffDate);
    const cancellationTimeFormatted = formatTimeForMessage(cancellationDeadline);
    const cancellationDateFormatted = cancellationDeadline.getDate();
    const cancellationMonthFormatted = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][cancellationDeadline.getMonth()];

    const responseMessage = `New booking was successfully created. \n${car.model} is booked for ${pickupDateFormatted} - ${dropOffDateFormatted} \nYou can change booking details until ${cancellationTimeFormatted} ${cancellationDateFormatted} ${cancellationMonthFormatted}.\nYour order: ${orderNo}`;

    return response(200, {
      message: responseMessage
    });

  } catch (error) {
    console.error(error);
    return response(500, { message: 'Internal server error', error: error.message });
  }
};

module.exports = { createBookingHandler };