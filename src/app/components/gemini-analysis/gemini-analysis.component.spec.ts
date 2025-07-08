import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeminiAnalysisComponent } from './gemini-analysis.component';

describe('GeminiAnalysisComponent', () => {
  let component: GeminiAnalysisComponent;
  let fixture: ComponentFixture<GeminiAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeminiAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeminiAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
