import { TestBed } from '@angular/core/testing';

import { CarBookService } from './car-book.service';

describe('CarBookService', () => {
  let service: CarBookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarBookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
