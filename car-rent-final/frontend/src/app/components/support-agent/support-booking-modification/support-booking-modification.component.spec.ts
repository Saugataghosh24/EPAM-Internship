import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportBookingModificationComponent } from './support-booking-modification.component';

describe('SupportBookingModificationComponent', () => {
  let component: SupportBookingModificationComponent;
  let fixture: ComponentFixture<SupportBookingModificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportBookingModificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportBookingModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
