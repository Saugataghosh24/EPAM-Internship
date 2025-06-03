import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarDetailsModalComponent } from './car-details-modal.component';

describe('CarDetailsModalComponent', () => {
  let component: CarDetailsModalComponent;
  let fixture: ComponentFixture<CarDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
