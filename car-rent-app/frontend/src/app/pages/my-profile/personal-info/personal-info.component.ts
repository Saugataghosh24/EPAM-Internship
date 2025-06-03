// personal-info.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PersonalInfoService, PersonalInfo } from '../../../services/personal-info.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './personal-info.component.html',
  providers: [PersonalInfoService]
})
export class PersonalInfoComponent implements OnInit {
  // Original data (for display in header)
  originalInfo: PersonalInfo | null = null;
  
  // Editable copy (for form inputs)
  editableInfo: PersonalInfo | null = null;
  
  // New image preview (temporary until saved)
  newImagePreview: string | null = null;
  
  isLoading = true;
  isSaving = false;
  showSuccessMessage = false;
  successMessage = '';
  errorMessage = '';

  constructor(private personalInfoService: PersonalInfoService) {}

  ngOnInit(): void {
    this.loadPersonalInfo();
  }

  loadPersonalInfo(): void {
    // For now, we're hardcoding the ID - in a real app, you might get this from a route param or auth service
    const userId = '01ae'; // Example ID from your data
    
    this.isLoading = true;
    this.personalInfoService.getPersonalInfoById(userId).subscribe({
      next: (data) => {
        this.originalInfo = { ...data }; // Store original
        this.editableInfo = { ...data }; // Create editable copy
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading personal info:', error);
        this.errorMessage = 'Failed to load personal information. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  saveChanges(): void {
    if (!this.editableInfo) return;
    
    // If there's a new image preview, update the editable info's imageUrl
    if (this.newImagePreview) {
      this.editableInfo.imageUrl = this.newImagePreview;
    }
    
    this.isSaving = true;
    this.personalInfoService.updatePersonalInfo(this.editableInfo).subscribe({
      next: (updatedInfo) => {
        // Update both original and editable copies
        this.originalInfo = { ...updatedInfo };
        this.editableInfo = { ...updatedInfo };
        
        // Clear the temporary image preview
        this.newImagePreview = null;
        
        this.showSuccessNotification('Personal information updated successfully!');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating personal info:', error);
        this.errorMessage = 'Failed to update personal information. Please try again.';
        this.isSaving = false;
      }
    });
  }

  showSuccessNotification(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  // Method to handle file selection for profile image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Create a temporary preview URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Store the preview URL temporarily (don't update originalInfo yet)
          this.newImagePreview = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    document.getElementById('profileImageInput')?.click();
  }
  
  // Method to discard changes and reset form
  discardChanges(): void {
    if (this.originalInfo) {
      this.editableInfo = { ...this.originalInfo };
      this.newImagePreview = null;
    }
  }
}