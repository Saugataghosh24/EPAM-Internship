import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocationInfoService } from '../../services/location-info.service';
import { LocationInfo } from '../../models/LocationInfo.model';

@Component({
  selector: 'app-location',
  imports: [NgFor,FormsModule,NgIf],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent {
  constructor(private locationinfoservice: LocationInfoService){}
  availableLocations:LocationInfo[] = [];
  pickup!:LocationInfo;
  dropoff!:LocationInfo;

  @Output() selectedlocations = new EventEmitter<{ pickupid: string, dropoffid: string }>();
  ngOnInit(){
    this.locationinfoservice.getLocationInfo().subscribe((locations)=>{
      this.availableLocations=locations;
      this.pickup= this.availableLocations[0];
      this.dropoff= this.availableLocations[0];
      // console.log(this.pickup,this.dropoff);
      this.selectedlocations.emit({
        pickupid: this.pickup.locationId,
        dropoffid: this.dropoff.locationId
      });
    })
  }

  
  updateLocation=false;

  toggleUpdate(){
    this.updateLocation=!this.updateLocation;
    this.selectedlocations.emit({pickupid: this.pickup.locationId, dropoffid: this.dropoff.locationId})
  }
}