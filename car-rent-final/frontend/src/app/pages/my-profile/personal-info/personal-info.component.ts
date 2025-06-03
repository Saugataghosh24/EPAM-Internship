// personal-info.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { PersonalInfoService, PersonalInfo, PersonalInfoUpdateRequest } from '../../../services/personal-info.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationComponent } from "../../../shared/notification/notification.component";

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NotificationComponent],
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
  selectedFile: File | null = null;
  
imageError: string = '';

alert='';
message=''
status=false;

  isLoading = true;
  isSaving = false;
  showSuccessMessage = false;
  successMessage = '';
  errorMessage = '';
  defaultImageUrl: string = 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI='; 

  // Form validation
  validationErrors: { [key: string]: string } = {};

  private userId = ""; 

  constructor(
    private personalInfoService: PersonalInfoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUser()?.userId!
    this.loadPersonalInfo();
  }

  loadPersonalInfo(): void {
    this.isLoading = true;
    this.personalInfoService.getPersonalInfoById(this.userId).subscribe({
      next: (data) => {
        this.originalInfo = { ...data }; // Store original
        this.editableInfo = { ...data }; // Create editable copy
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading personal info:', error);
        this.handleError(error, 'Failed to load personal information. Please try again later.');
        this.isLoading = false;
      }
    });
  }

 validateForm(): boolean {
  this.validationErrors = {};
  let isValid = true;
  
  if (!this.editableInfo) return false;
  
  // Name validation
  if (!this.editableInfo.firstName?.trim()) {
    this.validationErrors['firstName'] = 'First name is required';
    isValid = false;
  } else if (this.editableInfo.firstName.length > 50) {
    this.validationErrors['firstName'] = 'First name must be less than 50 characters';
    isValid = false;
  }
  
  if (!this.editableInfo.lastName?.trim()) {
    this.validationErrors['lastName'] = 'Last name is required';
    isValid = false;
  } else if (this.editableInfo.lastName.length > 50) {
    this.validationErrors['lastName'] = 'Last name must be less than 50 characters';
    isValid = false;
  }
  
  // Phone number validation - must be numbers and optional special characters
  if (this.editableInfo.phoneNumber) {
    const phoneRegex = /^[\d\s()+\-\.]{6,20}$/;
    if (!phoneRegex.test(this.editableInfo.phoneNumber)) {
      this.validationErrors['phoneNumber'] = 'Please enter a valid phone number (6-20 digits)';
      isValid = false;
    }
  }
  
  // Country validation
  if (this.editableInfo.country) {
    if (this.editableInfo.country.length < 2) {
      this.validationErrors['country'] = 'Country name must be at least 2 characters';
      isValid = false;
    } else if (this.editableInfo.country.length > 56) {
      this.validationErrors['country'] = 'Country name must be less than 56 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(this.editableInfo.country)) {
      this.validationErrors['country'] = 'Country name contains invalid characters';
      isValid = false;
    }
  }
  
  // City validation
  if (this.editableInfo.city) {
    if (this.editableInfo.city.length < 2) {
      this.validationErrors['city'] = 'City name must be at least 2 characters';
      isValid = false;
    } else if (this.editableInfo.city.length > 85) {
      this.validationErrors['city'] = 'City name must be less than 85 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(this.editableInfo.city)) {
      this.validationErrors['city'] = 'City name contains invalid characters';
      isValid = false;
    }
  }
  
  // Postal code validation - varies by country, but we'll use a general pattern
  if (this.editableInfo.postalCode) {
    // General postal code validation (alphanumeric with optional spaces/dashes)
    if (this.editableInfo.postalCode.length < 3) {
      this.validationErrors['postalCode'] = 'Postal code is too short';
      isValid = false;
    } else if (this.editableInfo.postalCode.length > 10) {
      this.validationErrors['postalCode'] = 'Postal code is too long';
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s\-]+$/.test(this.editableInfo.postalCode)) {
      this.validationErrors['postalCode'] = 'Postal code contains invalid characters';
      isValid = false;
    }
  }
  
  // Street validation
  if (this.editableInfo.street) {
    if (this.editableInfo.street.length < 3) {
      this.validationErrors['street'] = 'Street address is too short';
      isValid = false;
    } else if (this.editableInfo.street.length > 100) {
      this.validationErrors['street'] = 'Street address is too long';
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s\-'\.\/,]+$/.test(this.editableInfo.street)) {
      this.validationErrors['street'] = 'Street address contains invalid characters';
      isValid = false;
    }
  }
  
  // Address consistency validation
  // If any address field is provided, check if other fields are also provided
  const hasAddressInfo = this.editableInfo.country || this.editableInfo.city || 
                        this.editableInfo.postalCode || this.editableInfo.street;
                        
  if (hasAddressInfo) {
    // If any address field is filled, country should be required
    if (!this.editableInfo.country) {
      this.validationErrors['country'] = 'Country is required when providing address information';
      isValid = false;
    }
    
    // If country and postal code are provided, city should also be provided
    if (this.editableInfo.country && this.editableInfo.postalCode && !this.editableInfo.city) {
      this.validationErrors['city'] = 'City is required when providing country and postal code';
      isValid = false;
    }
  }
  
  return isValid;
}

  saveChanges(): void {
    if (!this.editableInfo) return;
    
    // Validate form before submitting
    if (!this.validateForm()) {
      this.errorMessage = 'Please fix the validation errors before saving.';
      return;
    }
    
    this.isSaving = true;
    this.errorMessage = '';
    
    // Create update request object
    const updateRequest: PersonalInfoUpdateRequest = {
      firstName: this.editableInfo.firstName,
      lastName: this.editableInfo.lastName,
      phoneNumber: this.editableInfo.phoneNumber,
      country: this.editableInfo.country,
      city: this.editableInfo.city,
      postalCode: this.editableInfo.postalCode,
      street: this.editableInfo.street
    };
    
    // Add avatar file if selected
    if (this.selectedFile) {
      updateRequest.avatar = this.selectedFile;
    }
    
    // Send update request
    this.personalInfoService.updatePersonalInfo(this.userId, updateRequest).subscribe({
      next: (updatedInfo) => {
        // Update both original and editable copies
        this.originalInfo = { ...updatedInfo };
        this.editableInfo = { ...updatedInfo };
        
        // Clear the temporary image preview and selected file
        this.newImagePreview = null;
        this.selectedFile = null;
        
        this.showSuccessNotification('Personal information updated successfully!');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating personal info:', error);
        this.handleError(error, 'Failed to update personal information. Please try again.');
        this.isSaving = false;
      }
    });
  }

  handleError(error: any, defaultMessage: string): void {
    this.alert="Error";
      this.status=false;
    if (error instanceof HttpErrorResponse) {
      // Extract error message from the backend if available
      this.alert="Error";
      this.status=false;
      if (error.error?.message) {
        this.errorMessage = error.error.message;
        
      } else if (error.status === 0) {
        this.errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.status === 401) {
        this.errorMessage = 'Your session has expired. Please login again.';
      } else if (error.status === 403) {
        this.errorMessage = 'You do not have permission to perform this action.';
      } else {
        this.errorMessage = defaultMessage;
      }
      
    } else {
      this.errorMessage = defaultMessage;
    }
    this.message=this.errorMessage
  }

  showSuccessNotification(message: string): void {
    this.successMessage = message;
    this.alert="Congratulations"
    this.status=true;
    this.message=message;
    this.showSuccessMessage = true;
    
  }

  // Method to handle file selection for profile image
// Update the onFileSelected method to use the imageError property
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.imageError = ''; // Clear previous errors
  
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.imageError = 'Image size should be less than 5MB';
      // Reset the file input
      input.value = '';
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      this.imageError = 'Only image files are allowed';
      // Reset the file input
      input.value = '';
      return;
    }
    
    this.selectedFile = file;
    
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

// Update the cancelImageSelection method to also clear image errors
cancelImageSelection(): void {
  this.newImagePreview = null;
  this.selectedFile = null;
  this.imageError = ''; // Clear any image errors
  
  // Clear the file input value to allow re-selecting the same file
  const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

// Update the discardChanges method to also clear image errors
discardChanges(): void {
  if (this.originalInfo) {
    this.editableInfo = { ...this.originalInfo };
    this.cancelImageSelection(); // This will also clear imageError
    this.validationErrors = {};
    this.errorMessage = '';
  }
}

  triggerFileInput(): void {
    document.getElementById('profileImageInput')?.click();
  }
  

  

  
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImageUrl;
  }

  // Add these methods to your component class

// Clear a specific validation error
clearValidationError(field: string): void {
  if (this.validationErrors[field]) {
    delete this.validationErrors[field];
  }
}

// Clear image error
clearImageError(): void {
  this.imageError = '';
}
}