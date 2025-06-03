import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../../shared/button/button.component";
import { NotificationComponent } from "../../../shared/notification/notification.component";

interface Document {
  id: string;
  type: 'passport' | 'license';
  side: 'front' | 'back';
  name: string;
  size: string;
  uploaded: boolean;
  file?: File;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
  imports: [CommonModule, ButtonComponent, NotificationComponent]
})
export class DocumentsComponent implements OnInit {
  @ViewChild('fileInputPassportFront') fileInputPassportFront!: ElementRef;
  @ViewChild('fileInputPassportBack') fileInputPassportBack!: ElementRef;
  @ViewChild('fileInputLicenseFront') fileInputLicenseFront!: ElementRef;
  @ViewChild('fileInputLicenseBack') fileInputLicenseBack!: ElementRef;

  documents: Document[] = [];
  isLoading = false;
  isUploading = false;
  showSuccessMessage = false;
  successMessage = '';
  errorMessage = '';
  showDeleteConfirmation = false;
  documentToDelete: Document | null = null;
  alert=''
  status=false;
  message='';

  ngOnInit(): void {
    // Simulate loading documents
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      // You could load existing documents here if needed
    }, 1000);
  }

  getDocumentByType(type: 'passport' | 'license', side: 'front' | 'back'): Document | undefined {
    return this.documents.find(doc => doc.type === type && doc.side === side);
  }

  openFileSelector(type: 'passport' | 'license', side: 'front' | 'back'): void {
    if (type === 'passport' && side === 'front') {
      this.fileInputPassportFront.nativeElement.click();
    } else if (type === 'passport' && side === 'back') {
      this.fileInputPassportBack.nativeElement.click();
    } else if (type === 'license' && side === 'front') {
      this.fileInputLicenseFront.nativeElement.click();
    } else if (type === 'license' && side === 'back') {
      this.fileInputLicenseBack.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent, type: 'passport' | 'license', side: 'front' | 'back'): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file, type, side);
    }
  }

  onFileSelected(event: Event, type: 'passport' | 'license', side: 'front' | 'back'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.processFile(file, type, side);
    }
  }

  processFile(file: File, type: 'passport' | 'license', side: 'front' | 'back'): void {
    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      this.errorMessage = 'File size exceeds the 1MB limit.';
      return;
    }

    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.errorMessage = 'Invalid file type. Please upload a PDF, JPG, or PNG file.';
      this.message=this.errorMessage;
      this.status=false;
      this.alert='Error';
      return;
    }

    // Remove existing document of the same type and side
    this.documents = this.documents.filter(doc => !(doc.type === type && doc.side === side));

    // Add new document
    this.isUploading = true;
    
    // Simulate upload delay
    setTimeout(() => {
      const newDocument: Document = {
        id: Math.random().toString(36).substring(2, 15),
        type,
        side,
        name: file.name,
        size: this.formatFileSize(file.size),
        uploaded: true,
        file
      };
      
      this.documents.push(newDocument);
      this.isUploading = false;
      this.showSuccessMessage = true;
      this.successMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} ${side} uploaded successfully.`;
        this.message=this.successMessage;
      this.status=true;
      this.alert='Congratulations!';
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }, 1500);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  showDeleteDialog(document: Document): void {
    this.documentToDelete = document;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.documentToDelete = null;
    this.showDeleteConfirmation = false;
  }

  confirmDelete(): void {
    if (this.documentToDelete) {
      this.documents = this.documents.filter(doc => doc.id !== this.documentToDelete!.id);
      this.showDeleteConfirmation = false;
      this.documentToDelete = null;
      
      this.showSuccessMessage = true;
      this.successMessage = 'Document deleted successfully.';
         this.message=this.successMessage;
      this.status=true;
      this.alert='Congratulations!';
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }
}