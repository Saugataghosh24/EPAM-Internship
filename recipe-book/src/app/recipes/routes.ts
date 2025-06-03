// src/app/recipes/routes.ts
import { Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { AuthGuard } from '../core/guards/auth.guard';

export const RECIPE_ROUTES: Routes = [
  { path: '', component: RecipeListComponent },
  { 
    path: 'add', 
    component: RecipeFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'edit/:id', 
    component: RecipeFormComponent, 
    canActivate: [AuthGuard] 
  },
  {
    path: 'my-recipes',
    component: MyRecipesComponent,
    canActivate: [AuthGuard]
  },
  { path: ':id', component: RecipeDetailComponent }
];