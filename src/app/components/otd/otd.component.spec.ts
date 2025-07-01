import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtdComponent } from './otd.component';

describe('OtdComponent', () => {
  let component: OtdComponent;
  let fixture: ComponentFixture<OtdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
