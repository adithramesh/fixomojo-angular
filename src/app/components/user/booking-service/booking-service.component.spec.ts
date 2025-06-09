import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingServiceComponent } from './booking-service.component';

describe('BookingServiceComponent', () => {
  let component: BookingServiceComponent;
  let fixture: ComponentFixture<BookingServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
