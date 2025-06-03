import { TestBed } from '@angular/core/testing';

import { ActiveButtonService } from './active-button.service';

describe('ActiveButtonService', () => {
  let service: ActiveButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
