import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualiteListComponent } from './qualite-list.component';

describe('QualiteListComponent', () => {
  let component: QualiteListComponent;
  let fixture: ComponentFixture<QualiteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualiteListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
