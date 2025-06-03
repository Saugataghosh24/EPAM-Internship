import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarSummaryComponent } from './car-summary.component';

describe('CarSummaryComponent', () => {
  let component: CarSummaryComponent;
  let fixture: ComponentFixture<CarSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
