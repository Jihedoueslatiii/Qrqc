import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiIpProjetComponent } from './kpi-ip-projet.component';

describe('KpiIpProjetComponent', () => {
  let component: KpiIpProjetComponent;
  let fixture: ComponentFixture<KpiIpProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KpiIpProjetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiIpProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
