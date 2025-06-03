const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Location = require('../models/Location');
const Report = require('../models/Report'); // Assuming you have a Report model for storing reports
const { response } = require('../utils/response');

// Helper function to format date as DD.MM.YY
const formatDateShort = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
  
  const change = ((current - previous) / previous) * 100;
  return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
};

// Helper function to check if two date ranges are equal
const areDateRangesEqual = (start1, end1, start2, end2) => {
  return start1.getTime() === start2.getTime() && end1.getTime() === end2.getTime();
};

// Helper function to determine if a report is weekly or monthly
const getReportPeriodType = (startDate, endDate) => {
    // Check if it's a monthly report (first day to last day of a month)
    const isFirstDayOfMonth = startDate.getDate() === 1;
    
    const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const isLastDayOfMonth = endDate.getDate() === lastDayOfMonth.getDate() && 
                             endDate.getMonth() === lastDayOfMonth.getMonth() &&
                             endDate.getFullYear() === lastDayOfMonth.getFullYear();
    
    if (isFirstDayOfMonth && isLastDayOfMonth && 
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()) {
      return 'monthly';
    }
    
    // Check if it's a weekly report (a complete week starting from Monday)
    const dayOfWeek = startDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const isStartingMonday = dayOfWeek === 1;
    
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setDate(startDate.getDate() + 6); // Add 6 days to get Sunday
    
    const isEndingSunday = endDate.getDate() === expectedEndDate.getDate() &&
                           endDate.getMonth() === expectedEndDate.getMonth() &&
                           endDate.getFullYear() === expectedEndDate.getFullYear();
    
    if (isStartingMonday && isEndingSunday) {
      return 'weekly';
    }
    
    // If neither monthly nor weekly, it's a custom report
    return 'custom';
  };

const getSalesReportsHandler = async (event) => {
  // Handle OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    };
  }

  try {
    // Extract query parameters
    const {
      dateFrom,
      dateTo,
      locationId,
      carId,
      supportAgentId
    } = event.queryStringParameters || {};

    // Validate and parse dates
    let startDate, endDate, previousStartDate, previousEndDate;
    
    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return response(400, { message: "Invalid date format. Expected format: YYYY-MM-DD" });
      }
      
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      // Calculate previous period based on the duration of the selected period
      const durationMs = endDate.getTime() - startDate.getTime();
      previousEndDate = new Date(startDate.getTime() - 1); // Day before start date
      previousStartDate = new Date(previousEndDate.getTime() - durationMs);
    } else {
      // Default to last month if no dates provided
      endDate = new Date();
      startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - 1);
      
      // Calculate previous period (second last month)
      previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setMonth(previousEndDate.getMonth() - 1);
    }
    
    // Check if this is a standard report (weekly or monthly)
    const reportPeriodType = getReportPeriodType(startDate, endDate);
    
    // Try to find existing report in database if it's a standard report
    let existingReport = null;
    if (reportPeriodType !== 'custom') {
      const reportQuery = {
        dateFrom: startDate,
        dateTo: endDate,
        periodType: reportPeriodType,
        reportType: 'SALES'
      };
      
      if (locationId) reportQuery.locationId = locationId;
      if (carId) reportQuery.carId = carId;
      if (supportAgentId) reportQuery.supportAgentId = supportAgentId;
      
      existingReport = await Report.findOne(reportQuery);
      
      if (existingReport) {
        return response(200, { content: JSON.parse(existingReport.reportData) });
      }
    }
    
    // Build filter for bookings
    const bookingFilter = {
      $and: [
        { pickupDateTime: { $lte: endDate } },
        { dropOffDateTime: { $gte: startDate } },
        { bookingStatus: { $in: ['BOOKINGFINISHED', 'SERVICEPROVIDED'] } }
      ]
    };
    
    if (locationId) {
      bookingFilter.pickupLocationId = mongoose.Types.ObjectId(locationId);
    }
    
    if (carId) {
      bookingFilter.carId = mongoose.Types.ObjectId(carId);
    }
    
    if (supportAgentId) {
      bookingFilter.bookedBy = mongoose.Types.ObjectId(supportAgentId);
    }
    
    // Get bookings for the current period
    const bookings = await Booking.find(bookingFilter)
      .populate('carId', 'model registrationNumber milage')
      .populate('pickupLocationId', 'locationName')
      .populate('review', 'rating')
      .lean();
    
    // Build filter for previous period
    const previousBookingFilter = {
      $and: [
        { pickupDateTime: { $lte: previousEndDate } },
        { dropOffDateTime: { $gte: previousStartDate } },
        { bookingStatus: { $in: ['BOOKINGFINISHED', 'SERVICEPROVIDED'] } }
      ]
    };
    
    if (locationId) {
      previousBookingFilter.pickupLocationId = mongoose.Types.ObjectId(locationId);
    }
    
    if (carId) {
      previousBookingFilter.carId = mongoose.Types.ObjectId(carId);
    }
    
    if (supportAgentId) {
      previousBookingFilter.bookedBy = mongoose.Types.ObjectId(supportAgentId);
    }
    
    // Get bookings for the previous period
    const previousBookings = await Booking.find(previousBookingFilter)
      .populate('carId', 'model registrationNumber milage')
      .populate('review', 'rating')
      .lean();
    
    // Group bookings by car
    const carBookingsMap = {};
    const previousCarBookingsMap = {};
    
    // Process current period bookings
    bookings.forEach(booking => {
      const carId = booking.carId._id.toString();
      if (!carBookingsMap[carId]) {
        carBookingsMap[carId] = {
          bookings: [],
          car: booking.carId,
          location: booking.pickupLocationId
        };
      }
      carBookingsMap[carId].bookings.push(booking);
    });
    
    // Process previous period bookings
    previousBookings.forEach(booking => {
      const carId = booking.carId._id.toString();
      if (!previousCarBookingsMap[carId]) {
        previousCarBookingsMap[carId] = {
          bookings: [],
          car: booking.carId
        };
      }
      previousCarBookingsMap[carId].bookings.push(booking);
    });
    
    // Generate report data
    const reportData = [];
    
    for (const carId in carBookingsMap) {
      const { bookings, car, location } = carBookingsMap[carId];
      const previousCarData = previousCarBookingsMap[carId];
      
      // Calculate statistics for current period
      const daysRent = calculateRentDays(bookings, startDate, endDate);
      const reservationCount = bookings.length;
      
      // Find earliest and latest mileage readings
      let startMilage = car.milage || 0;
      let endMilage = car.milage || 0;
      
      bookings.forEach(booking => {
        if (booking.startMilage && booking.startMilage < startMilage) {
          startMilage = booking.startMilage;
        }
        if (booking.endMilage && booking.endMilage > endMilage) {
          endMilage = booking.endMilage;
        }
      });
      
      const totalRun = endMilage - startMilage;
      const avgMilage = reservationCount > 0 ? Math.round(totalRun / reservationCount) : 0;
      
      // Calculate ratings
      const ratings = bookings
        .filter(booking => booking.review && booking.review.rating)
        .map(booking => booking.review.rating);
      
      const avgRating = ratings.length > 0 
        ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) 
        : "0.0";
      
      const minRating = ratings.length > 0 
        ? Math.min(...ratings).toString() 
        : "0";
      
      // Calculate revenue
      const revenue = bookings.reduce((sum, booking) => sum + (booking.revenue || 0), 0);
      
      // Calculate previous period statistics
      let previousAvgMilage = 0;
      let previousAvgRating = 0;
      let previousRevenue = 0;
      
      if (previousCarData) {
        const prevBookings = previousCarData.bookings;
        
        // Previous mileage
        let prevStartMilage = car.milage || 0;
        let prevEndMilage = car.milage || 0;
        
        prevBookings.forEach(booking => {
          if (booking.startMilage && booking.startMilage < prevStartMilage) {
            prevStartMilage = booking.startMilage;
          }
          if (booking.endMilage && booking.endMilage > prevEndMilage) {
            prevEndMilage = booking.endMilage;
          }
        });
        
        const prevTotalRun = prevEndMilage - prevStartMilage;
        previousAvgMilage = prevBookings.length > 0 ? Math.round(prevTotalRun / prevBookings.length) : 0;
        
        // Previous ratings
        const prevRatings = prevBookings
          .filter(booking => booking.review && booking.review.rating)
          .map(booking => booking.review.rating);
        
        previousAvgRating = prevRatings.length > 0 
          ? (prevRatings.reduce((sum, rating) => sum + rating, 0) / prevRatings.length)
          : 0;
        
        // Previous revenue
        previousRevenue = prevBookings.reduce((sum, booking) => sum + (booking.revenue || 0), 0);
      }
      
      // Calculate deltas
      const deltaAvgMilage = calculatePercentageChange(avgMilage, previousAvgMilage);
      const deltaAvgRating = calculatePercentageChange(parseFloat(avgRating), previousAvgRating);
      const deltaRevenue = calculatePercentageChange(revenue, previousRevenue);
      
      // Format location
      const locationName = location ? 
        location.locationName.split(',')[0]: 
        'Unknown';
      
      // Add to report data
      reportData.push({
        dateFrom: formatDateShort(startDate),
        dateTo: formatDateShort(endDate),
        location: locationName,
        carModel: car.model || 'Unknown',
        registrationNumber: car.registrationNumber || 'N/A',
        daysRent: daysRent.toString(),
        reservationCount: reservationCount.toString(),
        startMilage: startMilage.toString(),
        endMilage: endMilage.toString(),
        totalRun: totalRun.toString(),
        avgMilage: avgMilage.toString(),
        deltaAvgMilage,
        avgRating,
        minRating,
        deltaAvgRating,
        revenue: revenue.toString(),
        deltaRevenue
      });
    }
    
    // Save report if it's a standard report
    if (reportPeriodType !== 'custom' && reportData.length > 0) {
      const newReport = new Report({
        dateFrom: startDate,
        dateTo: endDate,
        periodType: reportPeriodType,
        reportData: JSON.stringify(reportData),
        locationId: locationId || null,
        carId: carId || null,
        supportAgentId: supportAgentId || null,
        reportType: "SALES"
      });
      
      await newReport.save();
    }
    
    return response(200, { content: reportData });
    
  } catch (error) {
    console.error('Error generating reports:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

// Helper function to calculate total rent days within the period
function calculateRentDays(bookings, periodStart, periodEnd) {
  let totalDays = 0;
  
  bookings.forEach(booking => {
    // Get the overlap between booking period and report period
    const overlapStart = new Date(Math.max(booking.pickupDateTime, periodStart));
    const overlapEnd = new Date(Math.min(booking.dropOffDateTime, periodEnd));
    
    // Calculate days in the overlap period
    const diffTime = Math.abs(overlapEnd - overlapStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    totalDays += diffDays;
  });
  
  return totalDays;
}

module.exports = { getSalesReportsHandler };