import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LocationInfo } from '../../models/LocationInfo.model';
import { LocationInfoService } from '../../services/location-info.service';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit{
  locations: LocationInfo[]=[]
  isLoading=true;
  error:string|null=null;
  selectedLocation:LocationInfo|null=null;

  constructor(private sanitizer: DomSanitizer, private locationInfoService:LocationInfoService) {

  }
  ngOnInit(): void {
    this.loadLocation();
  }
  loadLocation(){
    this.isLoading=true;
    this.error=null;
    this.locationInfoService.getLocationInfo().subscribe({
      next:(data)=>{
        this.locations=data;
        this.sanitizeUrl();
        this.isLoading=false;
      },
      error:(err)=>{
        console.error('Error fetching location data:', err);
        this.error = 'Failed to load location data. Please try again later.';
        this.isLoading = false;
      }
    })
  }
  sanitizeUrl(){
        // Sanitize all URLs
        this.locations.forEach(loc => {
          loc.safeMapSrc = this.sanitizer.bypassSecurityTrustResourceUrl(loc.locationImageUrl);
        });
        this.selectedLocation = this.locations[0];
  }
  selectLocation(loc: any) {
    this.selectedLocation = loc;
  }
}
