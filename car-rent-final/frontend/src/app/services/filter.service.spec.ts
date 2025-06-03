import { TestBed } from '@angular/core/testing';

import { SearchFilterService } from './filter.service';

describe('FilterService', () => {
  let service: SearchFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
