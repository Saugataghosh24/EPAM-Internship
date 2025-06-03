import { Component, OnInit, OnDestroy, ChangeDetectorRef,HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink,Router, RouterLinkActive } from '@angular/router';
import { ActiveButtonService } from '../../services/active-button.service';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { Subscription,fromEvent } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink,RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  activeBtn: string = 'Home';
  loggedIn: boolean = false;
  showDropdown = false;
  isSidebarOpen = false;
  isSmallScreen: boolean = false;
  private resizeSubscription: Subscription | undefined;
  profileImgUrl = 'assets/images/profileAvatar.png';
  name?: string;
  role?: string;
  // Add these properties to your component
  isAuthLoading = true;
  private authSubscription?: Subscription;
  
  constructor(
    private activeButtonService: ActiveButtonService,
    private authService: AuthService,
    private router:Router,
    private cdr:ChangeDetectorRef,
    private elementRef:ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
     if (isPlatformBrowser(this.platformId)) {
    // Check if we already have auth state from sessionStorage
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      try {
        const userState = JSON.parse(sessionUser);
        this.isAuthLoading = false;
      } catch (e) {
        console.error('Error parsing user state from sessionStorage', e);
      }
    }
  }
    
    // Initial check
    this.updateAuthState();
    
    // Subscribe to auth changes
    this.authSubscription = this.authService.currentUser$.subscribe((user: LoginResponse | null) => {
       this.isAuthLoading = false;
      this.loggedIn = !!user;
      if (user) {
        this.name = user.username.split(' ')[0];
        this.role = user.role;
        this.profileImgUrl = user.userImageUrl || 'assets/images/profileAvatar.png';
      } else {
        this.name = undefined;
        this.role = undefined;
      }
      //this.setDefaultActive();
    });
    
    // Subscribe to active button changes
    this.activeButtonService.currentActiveButton.subscribe(buttonName => {
      this.activeBtn = buttonName;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize(); // initial check
      this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
        this.checkScreenSize();
      });
    }
    
  }
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isSmallScreen = window.innerWidth <= 768;
    }
  }
  ngOnDestroy() {
    // Clean up subscriptions
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.resizeSubscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    // Check if the click was outside the dropdown toggle area
    if (this.showDropdown && !this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
    if (this.isSidebarOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isSidebarOpen = false;
    }

  }

  updateAuthState() {
    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      const user = this.authService.getUser();
      if (user) {
        this.name = user.username;
        this.role = user.role;
        this.profileImgUrl = user.userImageUrl || 'assets/images/profileAvatar.png';
      }
    }
    this.setDefaultActive();
  }
  
  setDefaultActive() {
    if (this.loggedIn) {
      if (this.role === 'Client') {
        this.activeBtn = 'Home';
      } else if (this.role === 'Admin') {
        this.activeBtn = 'Dashboard';
      } else if (this.role === 'Support') {
        this.activeBtn = 'Bookings';
      }
    } else {
      this.activeBtn = "Home";
    }
    // Update the service
    this.activeButtonService.setActiveButton(this.activeBtn);
  }

  setActive(btn: string) {
    this.activeBtn = btn;
    // Also update the service when a button is clicked
    this.activeButtonService.setActiveButton(btn);
  }
  
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if(this.isSidebarOpen)this.isSidebarOpen=false;
  }
  
  toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
  if(this.showDropdown) this.showDropdown=false;
  }

  logout() {
  this.showDropdown = false;
  
  this.authService.logout();

  this.router.navigate(['/']);
  this.setActive('Home');
  
  // Force change detection
  this.cdr.detectChanges();
    // No need to toggle loggedIn here as the subscription will handle it
  }
}