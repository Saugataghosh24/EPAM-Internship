import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, input, Output} from '@angular/core';
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

  @Input() pickup!:string;
  @Input() dropoff!:string;
  @Input() locationName!:string;
  cuser=JSON.parse(sessionStorage.getItem('user') as string);
  updateLocation=false;

  @Output() selectedlocations = new EventEmitter<{ pickupid: string, dropoffid: string }>();
  ngOnInit(){
    if(this.cuser.role==='Support'){
      this.updateLocation=true;
    }
    this.locationinfoservice.getlocations().subscribe((locations)=>{
      this.availableLocations=locations.content;
      if(!this.pickup){
        this.pickup= this.availableLocations.find(loc => loc.locationName === this.locationName)?.locationId || this.availableLocations[0].locationId;
      }
      if(!this.dropoff){
        this.dropoff= this.availableLocations[0].locationId;
      }
      this.selectedlocations.emit({
        pickupid: this.pickup,
        dropoffid: this.dropoff
      });
    })
  }


  
  toggleUpdate(){
    this.updateLocation=!this.updateLocation;
    this.selectedlocations.emit({pickupid: this.pickup, dropoffid: this.dropoff})
  }
  getLocationName(locationId: string): string {
    const location = this.availableLocations.find(loc => loc.locationId === locationId);
    return location ? location.locationName : '';
  }
}