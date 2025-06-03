const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Location = require('../models/Location');
const Report = require('../models/Report'); // Assuming you have an AgentReport model
const { response } = require('../utils/response');

// Helper function to format date as DD.MM.YY
const formatDateShort = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

// Helper function to calculate percentage change
// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
    if (previous === 0 && current === 0) return "0%";
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    if (current === 0) return "-100%"; // If current is zero but previous wasn't
    
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
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

const getAgentsReportHandler = async (event) => {
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

    const isValidId = (id) => {
        // For MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) return true;
    }  
        
    if (locationId && !isValidId(locationId)) {
      return response(400, { message: "Invalid locationId format" });
    }
    if (carId && !isValidId(carId)) {
        return response(400, { message: "Invalid carId format" });
    }
    if (supportAgentId && !isValidId(supportAgentId)) {
        return response(400, { message: "Invalid supportAgentId format"});
    }
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
        reportType: "AGENTS"
      };
      
      if (locationId) reportQuery.locationId = locationId;
      if (carId) reportQuery.carId = carId;
      if (supportAgentId) reportQuery.supportAgentId = supportAgentId;
      
      existingReport = await Report.findOne(reportQuery);
      
      if (existingReport) {
        return response(200, { content: JSON.parse(existingReport.reportData) });
      }
    }
    
    // First, find all support agents
    const agentsQuery = { role: 'Support' };
    
    if (supportAgentId) {
      agentsQuery._id = mongoose.Types.ObjectId(supportAgentId);
    }
    
    const supportAgents = await User.find(agentsQuery)
      .select('_id firstName lastName email')
      .lean();
    
    if (!supportAgents || supportAgents.length === 0) {
      return response(200, { content: [] });
    }
    
    // Get all agent IDs
    const agentIds = supportAgents.map(agent => agent._id);
    
    // Build filter for bookings
    const bookingFilter = {
      bookedBy: { $in: agentIds },
      $and: [
        { pickupDateTime: { $lte: endDate } },
        { dropOffDateTime: { $gte: startDate } },
        { bookingStatus: { $in: ['BOOKINGFINISHED', 'SERVICEPROVIDED'] } }
      ]
    };
    let filterLocationName="All Location";
    if (locationId) {
      bookingFilter.pickupLocationId = mongoose.Types.ObjectId(locationId);
      const location = await Location.findById(locationId);
      filterLocationName=location.locationName.split(",")[0] || "";
    }
    
    if (carId) {
      bookingFilter.carId = mongoose.Types.ObjectId(carId);
    }
    
    // Get bookings for the current period
    const bookings = await Booking.find(bookingFilter)
      .populate('bookedBy', 'firstName lastName email')
      .populate('pickupLocationId', 'locationName')
      .populate('review', 'rating')
      .lean();
    
    // Build filter for previous period
    const previousBookingFilter = {
      bookedBy: { $in: agentIds },
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
    
    // Get bookings for the previous period
    const previousBookings = await Booking.find(previousBookingFilter)
      .populate('bookedBy', 'firstName lastName')
      .populate('review', 'rating')
      .lean();
    
    // Group bookings by agent
    const agentBookingsMap = {};
    const previousAgentBookingsMap = {};
    
    // Process current period bookings
    bookings.forEach(booking => {
      if (!booking.bookedBy) return;
      
      const agentId = booking.bookedBy._id.toString();
      if (!agentBookingsMap[agentId]) {
        agentBookingsMap[agentId] = {
          bookings: [],
          agent: booking.bookedBy,
          //location: booking.pickupLocationId
        };
      }
      agentBookingsMap[agentId].bookings.push(booking);
    });
    
    // Process previous period bookings
    previousBookings.forEach(booking => {
      if (!booking.bookedBy) return;
      
      const agentId = booking.bookedBy._id.toString();
      if (!previousAgentBookingsMap[agentId]) {
        previousAgentBookingsMap[agentId] = {
          bookings: [],
          agent: booking.bookedBy
        };
      }
      previousAgentBookingsMap[agentId].bookings.push(booking);
    });
    
    // Generate report data
const reportData = [];

// For each agent, calculate statistics
supportAgents.forEach(agent => {
  const agentId = agent._id.toString();
  const agentData = agentBookingsMap[agentId];
  const previousAgentData = previousAgentBookingsMap[agentId];
  
  // Calculate current period statistics
  const bookingProcessed = agentData ? agentData.bookings.length : 0;
  
  // Get location information if available
  
  const locationName = filterLocationName || 'All Locations';
  
  // Calculate ratings for current period
  let avgRating = "0.0";
  let minRating = "0";
  
  if (agentData) {
    const ratings = agentData.bookings
      .filter(booking => booking.review && booking.review.rating)
      .map(booking => booking.review.rating);
    
    avgRating = ratings.length > 0 
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) 
      : "0.0";
    
    minRating = ratings.length > 0 
      ? Math.min(...ratings).toString() 
      : "0";
  }
  
  // Calculate revenue for current period
  const revenue = agentData 
    ? agentData.bookings.reduce((sum, booking) => sum + (booking.revenue || 0), 0)
    : 0;
  
  // Calculate previous period statistics
  let previousBookingProcessed = 0;
  let previousAvgRating = 0;
  let previousRevenue = 0;
  
  if (previousAgentData) {
    const prevBookings = previousAgentData.bookings;
    previousBookingProcessed = prevBookings.length;
    
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
  
  // Calculate deltas - even if current period has zero bookings
  const deltaBookingProcessed = calculatePercentageChange(bookingProcessed, previousBookingProcessed);
  const deltaAvgRating = calculatePercentageChange(parseFloat(avgRating), previousAvgRating);
  const deltaRevenue = calculatePercentageChange(revenue, previousRevenue);
  
  // Add to report data
  reportData.push({
    location: locationName,
    agentName: `${agent.firstName || ''} ${agent.lastName || ''}`.trim(),
    email: agent.email || "N/A",
    dateFrom: formatDateShort(startDate),
    dateTo: formatDateShort(endDate),
    bookingProcessed: bookingProcessed.toString(),
    deltaBookingProcessed,
    avgRating,
    minRating,
    deltaAvgRating,
    revenue: revenue.toString(),
    deltaRevenue
  });
});
    
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
        reportType : "AGENTS"
      });
      
      await newReport.save();
    }
    
    return response(200, { content: reportData });
    
  } catch (error) {
    console.error('Error generating agent reports:', error);
    return response(500, { 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

module.exports = { getAgentsReportHandler };