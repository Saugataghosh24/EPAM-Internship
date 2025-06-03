// src/app/recipes/recipe-form/recipe-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Recipe } from '../../core/models/recipe.model';
import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.css']
})
export class RecipeFormComponent implements OnInit {
  isEditMode = false;
  recipeId: string | null = null;
  
  recipeForm: Partial<Recipe> = {
    name: '',
    description: '',
    steps: [''],
    cuisineType: '',
    category: '',
    tags: [],
    ingredients: [''],
    difficultyLevel: '',
    cookingTime: 0,
    dietaryRestrictions: [],
    imageUrl: ''
  };
  
  cuisineTypes = ['American', 'Italian', 'Spanish', 'Lebanese', 'Chinese', 'Thai', 'Indian', 'French', 'Mexican', 'Mediterranean', 'Irish'];
  categories = ['Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Breakfast', 'Snack'];
  difficultyLevels = ['Easy', 'Medium', 'Hard'];
  dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Keto', 'Paleo'];
  
  tagInput = '';
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (!this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.recipeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recipeId;
    
    if (this.isEditMode && this.recipeId) {
      const recipe = this.recipeService.getRecipeById(this.recipeId);
      
      if (!recipe) {
        this.router.navigate(['/recipes']);
        return;
      }
      
      if (recipe.userId !== this.authService.currentUserValue.id) {
        this.router.navigate(['/recipes']);
        return;
      }
      
      this.recipeForm = { ...recipe };
      this.imagePreview = recipe.imageUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.recipeForm.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  addIngredient(): void {
    this.recipeForm.ingredients = [...(this.recipeForm.ingredients || []), ''];
  }

  removeIngredient(index: number): void {
    const ingredients = [...(this.recipeForm.ingredients || [])];
    ingredients.splice(index, 1);
    this.recipeForm.ingredients = ingredients;
  }

  addStep(): void {
    this.recipeForm.steps = [...(this.recipeForm.steps || []), ''];
  }

  removeStep(index: number): void {
    const steps = [...(this.recipeForm.steps || [])];
    steps.splice(index, 1);
    this.recipeForm.steps = steps;
  }

  addTag(): void {
    if (this.tagInput.trim()) {
      const tag = this.tagInput.trim();
      if (!this.recipeForm.tags?.includes(tag)) {
        this.recipeForm.tags = [...(this.recipeForm.tags || []), tag];
      }
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.recipeForm.tags = this.recipeForm.tags?.filter(t => t !== tag);
  }

  toggleDietaryRestriction(restriction: string): void {
    if (!this.recipeForm.dietaryRestrictions) {
      this.recipeForm.dietaryRestrictions = [];
    }
    
    const index = this.recipeForm.dietaryRestrictions.indexOf(restriction);
    if (index === -1) {
      this.recipeForm.dietaryRestrictions.push(restriction);
    } else {
      this.recipeForm.dietaryRestrictions.splice(index, 1);
    }
  }

  isDietarySelected(restriction: string): boolean {
    return this.recipeForm.dietaryRestrictions?.includes(restriction) || false;
  }

  onSubmit(): void {
    // Validate form
    if (!this.recipeForm.name || !this.recipeForm.description || 
        !this.recipeForm.cuisineType || !this.recipeForm.category || 
        !this.recipeForm.difficultyLevel || !this.recipeForm.cookingTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!this.recipeForm.ingredients?.length || 
        this.recipeForm.ingredients.some(i => !i.trim())) {
      alert('Please add at least one ingredient');
      return;
    }
    
    if (!this.recipeForm.steps?.length || 
        this.recipeForm.steps.some(s => !s.trim())) {
      alert('Please add at least one step');
      return;
    }
    
    // Clean up empty values
    this.recipeForm.ingredients = this.recipeForm.ingredients.filter(i => i.trim());
    this.recipeForm.steps = this.recipeForm.steps.filter(s => s.trim());
    
    let success: boolean;
    
    if (this.isEditMode && this.recipeId) {
      success = this.recipeService.updateRecipe(this.recipeForm as Recipe);
    } else {
      success = this.recipeService.addRecipe(this.recipeForm);
    }
    
    if (success) {
      this.router.navigate(['/recipes']);
    } else {
      alert('There was an error saving your recipe. Please try again.');
    }
  }

  cancel(): void {
    this.router.navigate(['/recipes']);
  }
}