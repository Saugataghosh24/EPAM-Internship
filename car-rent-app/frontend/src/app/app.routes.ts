import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { AuthComponent } from './pages/auth/auth.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { CarListComponent } from './pages/cars/cars.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { BookingModificationComponent } from './pages/client-dashboard/booking-modification/booking-modification.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { ChangePasswordComponent } from './pages/my-profile/change-password/change-password.component';
import { DocumentsComponent } from './pages/my-profile/documents/documents.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'bookings',
    component: ClientDashboardComponent,
  },
  {
    path: 'cars',
    component: CarListComponent,
  },

  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: 'sign-in', component: LoginComponent },
      { path: 'sign-up', component: RegistrationComponent },
    ],
  },
  { path: '', component: HomeComponent },
  { path: 'cars/carbooking/:carid', component: CheckoutComponent },
  {
    path: 'bookings/bookingmodification/:carid',
    component: BookingModificationComponent,
  },
  {
    path: 'users', component: MyProfileComponent,
    children: [
      { path: 'personal-info', component: PersonalInfoComponent },  
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'documents', component: DocumentsComponent },
    ]
  }
];
