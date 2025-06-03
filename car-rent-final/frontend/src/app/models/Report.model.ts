export interface ReportData {
    dateFrom: string;
    dateTo: string;
    location: string;
    carModel: string;
    registrationNumber: string;
    daysRent: string;
    reservationCount: string;
    startMilage: string;
    endMilage: string;
    totalRun: string;
    avgMilage: string;
    deltaAvgMilage: string;
    avgRating: string;
    minRating: string;
    deltaAvgRating: string;
    revenue: string;
    deltaRevenue: string;
  }
  
  export interface StaffPerformanceData {
    location: string;
    agentName: string;
    email: string;
    dateFrom: string;
    dateTo: string;
    bookingProcessed: string;
    deltaBookingProcessed: string;
    avgRating: string;
    minRating: string;
    deltaAvgRating: string;
    revenue: string;
    deltaRevenue: string;
  }
  
  export interface ReportFilter {
    reportType: string;
    dateFrom: string;
    dateTo: string;
    locationId: string;
  }
  
  export interface ReportResponse {
    content: ReportData[] | StaffPerformanceData[];
  }
  
 
  export enum ReportType {
    SALES_REPORT = 'Sales Report',
    STAFF_PERFORMANCE = 'Staff Performance'
  }