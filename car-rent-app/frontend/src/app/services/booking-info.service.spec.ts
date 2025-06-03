import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking-info.service';


describe('BookingInfoService', () => {
  let service: BookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
