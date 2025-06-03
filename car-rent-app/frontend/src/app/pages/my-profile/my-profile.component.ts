import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DocumentsComponent } from './documents/documents.component';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    PersonalInfoComponent,
    ChangePasswordComponent,
    DocumentsComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './my-profile.component.html'
})

export class MyProfileComponent implements OnInit {
  activeTab: string = 'personal-info';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    // Set initial active tab based on current route
    this.setActiveTabFromUrl(this.router.url);

    // Listen for route changes to update active tab
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setActiveTabFromUrl(event.url);
    });
  }

  private setActiveTabFromUrl(url: string) {
    if (url.includes('personal-info')) {
      this.activeTab = 'personal-info';
    } else if (url.includes('documents')) {
      this.activeTab = 'documents';
    } else if (url.includes('change-password')) {
      this.activeTab = 'change-password';
    } else if (url.includes('reviews')) {
      this.activeTab = 'reviews';
    }
  }
}