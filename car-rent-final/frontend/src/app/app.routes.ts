import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { AuthComponent } from './pages/auth/auth.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegistrationComponent } from './pages/auth/registration/registration.component';
import { CarListComponent } from './pages/cars/cars.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { BookingModificationComponent } from './pages/client-dashboard/booking-modification/booking-modification.component';
import { MainComponent } from './pages/main/main.component';
import { unifiedAuthGuard } from './core/guard/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SupportBookingModificationComponent } from './components/support-agent/support-booking-modification/support-booking-modification.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { PersonalInfoComponent } from './pages/my-profile/personal-info/personal-info.component';
import { DocumentsComponent } from './pages/my-profile/documents/documents.component';
import { ChangePasswordComponent } from './pages/my-profile/change-password/change-password.component';
import { ReviewsComponent } from './pages/my-profile/reviews/reviews.component';
import { SupportBookingComponent } from './components/support-agent/support-booking/support-booking.component';

export const routes: Routes = [
  // Support landing page - bookings management
  {
    path: 'bookings',
    component: SupportBookingComponent,
    canActivate: [unifiedAuthGuard({ allowedRoles: 'Support' })]
  },

  // Admin dashboard - admin only
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [unifiedAuthGuard({ allowedRoles: 'Admin' })],
  },
  
  // Client bookings page
  {
    path: 'mybookings',
    component: ClientDashboardComponent,
    canActivate: [unifiedAuthGuard({ allowedRoles: 'Client' })]
  },
   
  // Profile pages - accessible to all authenticated users
  {
    path: 'my-profile', 
    component: MyProfileComponent,
    canActivate: [unifiedAuthGuard({ allowedRoles: ['Client', 'Support', 'Admin'] })],
    children: [
      { path: '', redirectTo: 'personal-info', pathMatch: 'full' }, 
      { path: 'personal-info', component: PersonalInfoComponent },  
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'reviews', component: ReviewsComponent },
    ]
  },
  
  // Auth pages - only for non-authenticated users
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [unifiedAuthGuard({ allowGuests: true })],
    children: [
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      { path: 'sign-in', component: LoginComponent },
      { path: 'sign-up', component: RegistrationComponent },
    ],
  },
  
  // Client car booking page
  { 
    path: 'cars/carbooking/:carid', 
    component: CheckoutComponent,
    canActivate: [unifiedAuthGuard({ allowedRoles: ['Client', 'Support']})]
  },
  
  // Client booking modification
  {
    path: 'bookings/bookingmodification/:bookingid',
    component: BookingModificationComponent,
    canActivate: [unifiedAuthGuard({ allowedRoles: 'Client' })]
  },
  
  // Main section with common UI elements
  { 
    path: '', 
    component: MainComponent,
    // No guard at the parent level, we'll control access at the child level
    children: [
      // Home page - accessible only to Clients and guests
      {
        path: '', 
        component: HomeComponent, 
        pathMatch: 'full',
        canActivate: [unifiedAuthGuard({ 
          allowedRoles: 'Client',
          allowGuests: true 
        })]
      },
      // Cars page - accessible to Clients, Support and guests
      {
        path: 'cars', 
        component: CarListComponent, 
        pathMatch: 'full',
        canActivate: [unifiedAuthGuard({ 
          allowedRoles: ['Client', 'Support'],
          allowGuests: true 
        })]
      }
    ]
  },
  
  // Support booking modification
  {
    path: 'bookingmodification/:bookingid',
    component: SupportBookingModificationComponent,
    canActivate: [unifiedAuthGuard({ allowedRoles: 'Support' })]
  }
];