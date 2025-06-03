import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-personal-info',
  imports: [FormsModule,NgIf,NgFor],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoComponent {
  @Input() user:{username:string,email:string}|undefined
  cuser=JSON.parse(sessionStorage.getItem('user') as string);
  clt!:{userId:string,userName:string};
  @Output() clientDet = new EventEmitter<{userId:string,userName:string}>();
  allclients:any[]=[];
  changeclient=true;
  constructor(private authservice:AuthService){}

  ngOnInit(){
    if(this.cuser.role==='Support'){
      this.authservice.getAllUsers().subscribe((users)=>{
        // this.allclients = users.filter((u) => u.role === 'Client').map((u) => `${u.firstName} ${u.lastName}`);
        this.allclients=users.content;
        this.clt = this.allclients[0];
      })
    }
  }
  toggleUpdate(){
    if(this.changeclient===true && this.cuser.role==='Support'){
      this.clientDet.emit(this.clt);
    }
    this.changeclient=!this.changeclient;
  }
}
