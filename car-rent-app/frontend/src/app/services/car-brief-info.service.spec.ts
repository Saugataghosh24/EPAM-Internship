import { TestBed } from '@angular/core/testing';

import { CarBriefInfoService } from './car-brief-info.service';

describe('CarBriefInfoService', () => {
  let service: CarBriefInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarBriefInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
