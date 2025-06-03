import { TestBed } from '@angular/core/testing';

import { LocationInfoService } from './location-info.service';

describe('LocationInfoService', () => {
  let service: LocationInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
