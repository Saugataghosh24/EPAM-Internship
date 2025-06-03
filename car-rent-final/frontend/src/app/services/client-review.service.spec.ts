import { TestBed } from '@angular/core/testing';

import { ClientReviewService } from './client-review.service';

describe('ClientReviewService', () => {
  let service: ClientReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
