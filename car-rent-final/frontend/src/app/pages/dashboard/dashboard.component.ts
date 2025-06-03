import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportData, ReportFilter, ReportType, StaffPerformanceData } from '../../models/Report.model';
import { ReportService } from '../../services/report.service';
import { LocationInfo } from '../../models/LocationInfo.model';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { DateTimePickerComponent } from "../../shared/date-time-picker/date-time-picker.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [DatePipe],
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, DateTimePickerComponent]
})
export class DashboardComponent implements OnInit {
  filterForm: FormGroup;
  reportData: ReportData[] = [];
  staffPerformanceData: StaffPerformanceData[] = [];
  locations: LocationInfo[] = [];
  isLoading = false;
  error: string | null = null;
  showReport = false;
  reportTypes = Object.values(ReportType);
  currentReportType: ReportType = ReportType.SALES_REPORT;
  //time
  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(new Date().setMinutes(new Date().getMinutes()+30)),
    dropoff: new Date(new Date(new Date().setMinutes(new Date().getMinutes()+330)).setDate(new Date().getDate() + 5))
  };
  @Output() pickerOpen = new EventEmitter<boolean>();
  isDatePickerActive = false; // Add this property to your component

openPickup() {
  this.isDatePickerActive = true;
  this.pickerOpen.emit(true);
  this.isPickupVisible = this.isPickupVisible === true ? false : true;
}
  isPickupVisible=false;
  alreadybooked=false;
  selectedDates(dates:{pickup: Date, dropoff: Date}){
    // Prevent any form submission
    event?.preventDefault?.();
    event?.stopPropagation?.();
    
    const pickup = dates.pickup;
    const dropoff = dates.dropoff;
    this.dateTime = {pickup, dropoff};
  }
  pickerStatus(open: boolean) {
  this.isPickupVisible = open;
  // Reset active status when picker is closed
  if (!open) {
    setTimeout(() => {
      this.isDatePickerActive = false;
    }, 100);
  }
}

  constructor(
    private reportService: ReportService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    
    this.filterForm = this.fb.group({
      reportType: [ReportType.SALES_REPORT, Validators.required],
      locationId: ['']
    });
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    
    this.reportService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load locations';
        console.error('Error loading locations:', error);
        this.isLoading = false;
      }
    });
  }

  generateReport(): void {
    if (!this.filterForm.valid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    const filters: ReportFilter = this.filterForm.value;
    filters.dateFrom = this.datePipe.transform(this.dateTime.pickup, 'yyyy-MM-dd') || '';
    filters.dateTo = this.datePipe.transform(this.dateTime.dropoff, 'yyyy-MM-dd') || '';
    this.currentReportType = filters.reportType as ReportType;
    if (filters.reportType === ReportType.SALES_REPORT) {
      this.generateSalesReport(filters);
    } else if (filters.reportType === ReportType.STAFF_PERFORMANCE) {
      this.generateStaffPerformanceReport(filters);
    }
  }

  generateSalesReport(filters: ReportFilter): void {
    this.reportService.getReportData(filters)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.reportData = data;
          this.showReport = true;
        },
        error: (error) => {
          this.error = 'Failed to generate sales report. Please try again.';
          console.error('Error generating sales report:', error);
          this.showReport = false;
        }
      });
  }

  generateStaffPerformanceReport(filters: ReportFilter): void {
    this.reportService.getStaffPerformanceData(filters)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.staffPerformanceData = data;
          this.showReport = true;
        },
        error: (error) => {
          this.error = 'Failed to generate staff performance report. Please try again.';
          console.error('Error generating staff performance report:', error);
          this.showReport = false;
        }
      });
  }

  downloadReport(format: string): void {
    if (!this.filterForm.valid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    const filters: ReportFilter = this.filterForm.value;
    
    this.reportService.downloadReport(filters, format)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filters.reportType.replace(' ', '-')}-${new Date().toISOString()}.${format.toLowerCase()}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        },
        error: (error) => {
          this.error = `Failed to download report in ${format} format.`;
          console.error('Error downloading report:', error);
        }
      });
  }

  onReportTypeChange(): void {
    // Reset report display when changing report type
    this.showReport = false;
    this.reportData = [];
    this.staffPerformanceData = [];
    this.error = null;
    this.currentReportType = this.filterForm.get('reportType')?.value;
  }
}