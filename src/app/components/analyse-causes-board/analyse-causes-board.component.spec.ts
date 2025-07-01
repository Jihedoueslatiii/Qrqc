import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseCausesBoardComponent } from './analyse-causes-board.component';

describe('AnalyseCausesBoardComponent', () => {
  let component: AnalyseCausesBoardComponent;
  let fixture: ComponentFixture<AnalyseCausesBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyseCausesBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyseCausesBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
