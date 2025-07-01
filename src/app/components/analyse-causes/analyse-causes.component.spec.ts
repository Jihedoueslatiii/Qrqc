import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseCausesComponent } from './analyse-causes.component';

describe('AnalyseCausesComponent', () => {
  let component: AnalyseCausesComponent;
  let fixture: ComponentFixture<AnalyseCausesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyseCausesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyseCausesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
