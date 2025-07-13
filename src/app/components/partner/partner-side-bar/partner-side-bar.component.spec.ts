import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerSideBarComponent } from './partner-side-bar.component';

describe('PartnerSideBarComponent', () => {
  let component: PartnerSideBarComponent;
  let fixture: ComponentFixture<PartnerSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
