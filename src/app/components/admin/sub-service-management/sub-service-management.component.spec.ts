import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubServiceManagementComponent } from './sub-service-management.component';

describe('SubServiceManagementComponent', () => {
  let component: SubServiceManagementComponent;
  let fixture: ComponentFixture<SubServiceManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubServiceManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubServiceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
