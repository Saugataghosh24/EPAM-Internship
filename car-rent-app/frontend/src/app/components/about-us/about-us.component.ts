import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AboutUsStoryInfo } from '../../models/AboutUsStoryInfo.model';
import { AboutUsService } from '../../services/about-us.service';


@Component({
  selector: 'app-about-us',
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent implements OnInit{
  aboutUsStats:AboutUsStoryInfo[]=[];
  isLoading=true;
  error:string|null=null;
  // aboutUsStats = [
  //   {
  //     title: 'years',
  //     value: '15',
  //     description: 'in car rentals highlights a steadfast commitment to excellence, marked by a track record of trust and satisfaction among thousands of clients worldwide'
  //   },
  //   {
  //     title: 'locations',
  //     value: '6',
  //     description: 'we make car rentals accessible and convenient for customers no matter where their travels take them, ensuring quality service and easy access'
  //   },
  //   {
  //     title: 'car brands',
  //     value: '25',
  //     description: 'we cater to every kind of traveler, from business professionals to families and adventure seekers, ensuring the perfect vehicle is always available'
  //   },
  //   {
  //     title: 'cars',
  //     value: '100+',
  //     description: 'we cater to every kind of traveler, from business professionals to families and adventure seekers, ensuring the perfect vehicle is always available'
  //   }
  // ];
  
  constructor(private aboutUsService:AboutUsService){}
  ngOnInit(): void {
    this.loadAboutUsStats();
  }

  loadAboutUsStats(){
    this.isLoading=true;
    this.error=null;
    this.aboutUsService.getAboutUsStoryInfo().subscribe({
      next:(data)=>{
        this.aboutUsStats=data;
        this.isLoading=false;
      },
      error: (err) => {
        console.error('Error fetching AboutUs data:', err);
        this.error = 'Failed to load About Us data. Please try again later.';
        this.isLoading = false;
      }
    })
  }

}
