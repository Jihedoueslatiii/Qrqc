import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtdProjetComponent } from './otd-projet.component';

describe('OtdProjetComponent', () => {
  let component: OtdProjetComponent;
  let fixture: ComponentFixture<OtdProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtdProjetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtdProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
