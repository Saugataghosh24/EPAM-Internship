import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {  ReportData, ReportFilter, ReportResponse, ReportType, StaffPerformanceData } from '../models/Report.model';
import { LocationInfo, LocationInfoResponse } from '../models/LocationInfo.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  // Use a relative URL that will be proxied
  
  private apiUrl = environment.apiBaseUrl+'/reports';
  private homeUrl = environment.apiBaseUrl+'/home';
  private agentsUrl = environment.apiBaseUrl+'/reports/agents';

 
  constructor(private http: HttpClient) { }

  getReportData(filters: ReportFilter): Observable<ReportData[]> {
    // Only proceed if it's a Sales Report
    if (filters.reportType !== ReportType.SALES_REPORT) {
      throw new Error('Only Sales Reports are currently supported');
    }
    
    // Format dates in YYYY-MM-DD format as expected by the backend
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    
    // Create query parameters matching the expected format
    let params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);
    
    if (filters.locationId) {
      params = params.set('locationId', filters.locationId);
    }
    
    return this.http.get<ReportResponse>(this.apiUrl, { params })
      .pipe(
        map(response => {
          if (response && response.content && Array.isArray(response.content)) {
            return response.content as ReportData[];
          }
          console.error('Invalid response format:', response);
          return [];
        })
      );
  }

  getStaffPerformanceData(filters: ReportFilter): Observable<StaffPerformanceData[]> {
    // Only proceed if it's a Staff Performance Report
    if (filters.reportType !== ReportType.STAFF_PERFORMANCE) {
      throw new Error('Only Staff Performance Reports are supported by this method');
    }
    
    // Format dates in YYYY-MM-DD format as expected by the backend
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    
    // Create query parameters matching the expected format
    let params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);
    
    if (filters.locationId) {
      params = params.set('locationId', filters.locationId);
    }
    
    return this.http.get<ReportResponse>(this.agentsUrl, { params })
      .pipe(
        map(response => {
          if (response && response.content && Array.isArray(response.content)) {
            return response.content as StaffPerformanceData[];
          }
          console.error('Invalid response format:', response);
          return [];
        })
      );
  }

  getLocations(): Observable<LocationInfo[]> {
    return this.http.get<LocationInfoResponse>(`${this.homeUrl}/locations`)
      .pipe(
        map(response => {
          if (response && response.content && Array.isArray(response.content)) {
            return response.content;
          }
          console.error('Invalid locations response format:', response);
          return [];
        })
      );
  }

  downloadReport(filters: ReportFilter, format: string): Observable<Blob> {
    // Format dates in YYYY-MM-DD format
    const dateFrom = this.formatDateForApi(filters.dateFrom);
    const dateTo = this.formatDateForApi(filters.dateTo);
    
    let params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo)
      .set('format', format);
    
    if (filters.locationId) {
      params = params.set('locationId', filters.locationId);
    }
    
    // Determine the endpoint based on report type
    const endpoint = filters.reportType === ReportType.STAFF_PERFORMANCE 
      ? `${this.agentsUrl}/download` 
      : `${this.apiUrl}/download`;
    
    return this.http.get(endpoint, {
      params,
      responseType: 'blob'
    });
  }

  // Helper method to format dates from DD.MM.YY to YYYY-MM-DD
  private formatDateForApi(dateString: string): string {
    if (!dateString) return '';
    
    // Parse DD.MM.YY format
    const parts = dateString.split('.');
    if (parts.length !== 3) return dateString;
    
    const day = parts[0];
    const month = parts[1];
    let year = parts[2];
    
    // Convert 2-digit year to 4-digit year
    if (year.length === 2) {
      year = '20' + year; // Assuming all years are in the 21st century
    }
    
    // Return in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  }
}