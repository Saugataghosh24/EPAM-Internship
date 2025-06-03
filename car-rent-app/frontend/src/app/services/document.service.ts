// document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Document {
  id: string;
  name: string;
  size: string;
  type: 'passport' | 'license';
  category: 'front' | 'back';
  uploaded: boolean;
  url?: string;
  uploadDate?: Date;
}

export interface DocumentUploadProgress {
  documentId: string;
  progress: number;
  completed: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:3000/documents';
  private s3UploadUrl = 'http://localhost:3000/upload-to-s3'; // Replace with your actual S3 upload endpoint
  
  // Track upload progress for each document
  private uploadProgressSubject = new BehaviorSubject<DocumentUploadProgress[]>([]);
  uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all documents for a user
   * @param userId User ID
   * @returns Observable of Document array
   */
  getDocuments(userId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}?userId=${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Upload document to S3
   * @param file File to upload
   * @param documentType Type of document (passport/license)
   * @param category Category (front/back)
   * @param userId User ID
   * @returns Observable of Document
   */
  uploadDocumentToS3(file: File, documentType: 'passport' | 'license', category: 'front' | 'back', userId: string): Observable<Document> {
    // Create a unique document ID
    const documentId = `${userId}_${documentType}_${category}_${Date.now()}`;
    
    // Initialize progress tracking for this document
    this.updateUploadProgress(documentId, 0, false);
    
    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('category', category);
    formData.append('userId', userId);
    
    return this.http.post<Document>(this.s3UploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / (event.total || 1));
            this.updateUploadProgress(documentId, progress, false);
            return { type: 'progress', documentId, progress };
            
          case HttpEventType.Response:
            this.updateUploadProgress(documentId, 100, true);
            return event.body;
            
          default:
            return { type: 'other', documentId };
        }
      }),
      catchError((error) => {
        this.updateUploadProgress(documentId, 0, false, error.message);
        return this.handleError(error);
      }),
      // Filter out progress events to return only the final response
      map((event: any) => {
        if (event && event.type === undefined) {
          return event as Document;
        }
        return null;
      }),
      // Filter out null values
      map((doc: Document | null) => {
        if (doc) return doc;
        throw new Error('Upload failed');
      })
    );
  }

  /**
   * Delete document from S3 and database
   * @param documentId Document ID
   * @returns Observable of operation result
   */
  deleteDocument(documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${documentId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update upload progress for a document
   * @param documentId Document ID
   * @param progress Upload progress (0-100)
   * @param completed Whether upload is completed
   * @param error Error message if any
   */
  private updateUploadProgress(documentId: string, progress: number, completed: boolean, error?: string): void {
    const currentProgress = this.uploadProgressSubject.value;
    
    // Find existing progress entry or create new one
    const existingIndex = currentProgress.findIndex(p => p.documentId === documentId);
    if (existingIndex >= 0) {
      // Update existing entry
      const updatedProgress = [...currentProgress];
      updatedProgress[existingIndex] = { documentId, progress, completed, error };
      this.uploadProgressSubject.next(updatedProgress);
    } else {
      // Add new entry
      this.uploadProgressSubject.next([
        ...currentProgress,
        { documentId, progress, completed, error }
      ]);
    }
  }

  /**
   * Format file size in human-readable format
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(0) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  /**
   * Handle API errors
   * @param error HTTP error response
   * @returns Observable with error message
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    // This approach works in both browser and server
    if (!error.status) {
      // Client-side or network error
      errorMessage = `Network error: ${error.message}`;
    } else {
      // Server-side error with status code
      errorMessage = `Server error: ${error.status} ${error.message}`;
    }
    
    console.error('Document service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}