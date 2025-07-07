import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendKpiComponent } from './send-kpi.component';

describe('SendKpiComponent', () => {
  let component: SendKpiComponent;
  let fixture: ComponentFixture<SendKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendKpiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
