import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMonitoringComponent } from './project-monitoring.component';

describe('ProjectMonitoringComponent', () => {
  let component: ProjectMonitoringComponent;
  let fixture: ComponentFixture<ProjectMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectMonitoringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
