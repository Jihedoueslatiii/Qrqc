import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiIpListComponent } from './kpi-ip-list.component';

describe('KpiIpListComponent', () => {
  let component: KpiIpListComponent;
  let fixture: ComponentFixture<KpiIpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KpiIpListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiIpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
