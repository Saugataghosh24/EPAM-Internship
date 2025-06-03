import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingModificationComponent } from './booking-modification.component';

describe('BookingModificationComponent', () => {
  let component: BookingModificationComponent;
  let fixture: ComponentFixture<BookingModificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingModificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
