// documents.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DocumentService, Document } from '../../../services/document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
  providers: [DocumentService]
})
export class DocumentsComponent implements OnInit {
  @ViewChild('fileInputPassportFront') fileInputPassportFront!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputPassportBack') fileInputPassportBack!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputLicenseFront') fileInputLicenseFront!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputLicenseBack') fileInputLicenseBack!: ElementRef<HTMLInputElement>;
  
  documents: Document[] = [];
  isLoading = true;
  isUploading = false;
  showDeleteConfirmation = false;
  documentToDelete: Document | null = null;
  showSuccessMessage = false;
  successMessage = '';
  errorMessage = '';
  
  // Mock user ID - in a real app, get this from auth service
  userId = 'user123';
  
  constructor(private documentService: DocumentService) {}
  
  ngOnInit(): void {
    this.loadDocuments();
  }
  
  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getDocuments(this.userId).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.errorMessage = 'Failed to load documents. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  getDocumentByType(type: 'passport' | 'license', category: 'front' | 'back'): Document | undefined {
    return this.documents.find(doc => doc.type === type && doc.category === category);
  }
  
  openFileSelector(type: 'passport' | 'license', category: 'front' | 'back'): void {
    if (type === 'passport' && category === 'front') {
      this.fileInputPassportFront.nativeElement.click();
    } else if (type === 'passport' && category === 'back') {
      this.fileInputPassportBack.nativeElement.click();
    } else if (type === 'license' && category === 'front') {
      this.fileInputLicenseFront.nativeElement.click();
    } else if (type === 'license' && category === 'back') {
      this.fileInputLicenseBack.nativeElement.click();
    }
  }
  
  onFileSelected(event: Event, type: 'passport' | 'license', category: 'front' | 'back'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadDocument(file, type, category);
    }
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDrop(event: DragEvent, type: 'passport' | 'license', category: 'front' | 'back'): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.uploadDocument(file, type, category);
    }
  }
  
  uploadDocument(file: File, type: 'passport' | 'license', category: 'front' | 'back'): void {
    // Check file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      this.errorMessage = 'File size should not exceed 1MB';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only PDF, JPEG, and PNG files are allowed';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }
    
    this.isUploading = true;
    this.errorMessage = '';
    
    this.documentService.uploadDocumentToS3(file, type, category, this.userId).subscribe({
      next: (document) => {
        // Update documents array
        const existingIndex = this.documents.findIndex(doc => 
          doc.type === type && doc.category === category
        );
        
        if (existingIndex >= 0) {
          // Replace existing document
          this.documents[existingIndex] = document;
        } else {
          // Add new document
          this.documents.push(document);
        }
        
        this.isUploading = false;
        this.showSuccessNotification('Document uploaded successfully');
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.errorMessage = error.message || 'Failed to upload document. Please try again.';
        this.isUploading = false;
      }
    });
  }
  
  showDeleteDialog(document: Document): void {
    this.documentToDelete = document;
    this.showDeleteConfirmation = true;
  }
  
  confirmDelete(): void {
    if (!this.documentToDelete) return;
    
    const document = this.documentToDelete;
    this.documentService.deleteDocument(document.id).subscribe({
      next: () => {
        // Remove from documents array
        this.documents = this.documents.filter(doc => doc.id !== document.id);
        this.showDeleteConfirmation = false;
        this.documentToDelete = null;
        this.showSuccessNotification('Document deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting document:', error);
        this.errorMessage = 'Failed to delete document. Please try again.';
        this.showDeleteConfirmation = false;
        this.documentToDelete = null;
      }
    });
  }
  
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.documentToDelete = null;
  }
  
  showSuccessNotification(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }
}