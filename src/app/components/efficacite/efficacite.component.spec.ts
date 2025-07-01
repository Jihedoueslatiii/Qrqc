import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficaciteComponent } from './efficacite.component';

describe('EfficaciteComponent', () => {
  let component: EfficaciteComponent;
  let fixture: ComponentFixture<EfficaciteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EfficaciteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EfficaciteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
