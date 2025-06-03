import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportBookingComponent } from './support-booking.component';

describe('SupportBookingComponent', () => {
  let component: SupportBookingComponent;
  let fixture: ComponentFixture<SupportBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
