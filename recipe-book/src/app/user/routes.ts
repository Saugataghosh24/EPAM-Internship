// src/app/user/routes.ts
import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { AuthGuard } from '../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    canActivate: [AuthGuard]
  },
  { path: ':id', component: UserDetailComponent }
];