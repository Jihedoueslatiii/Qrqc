import { TestBed } from '@angular/core/testing';

import { KpiAlertServiceService } from './kpi-alert-service.service';

describe('KpiAlertServiceService', () => {
  let service: KpiAlertServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KpiAlertServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
