// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  { 
    path: 'recipes', 
    loadChildren: () => import('./recipes/routes').then(m => m.RECIPE_ROUTES) 
  },
  { 
    path: 'user', 
    loadChildren: () => import('./user/routes').then(m => m.USER_ROUTES) 
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/routes').then(m => m.AUTH_ROUTES) 
  },
  { path: '**', redirectTo: 'recipes' }
];