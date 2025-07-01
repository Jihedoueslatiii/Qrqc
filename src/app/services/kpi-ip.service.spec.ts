import { TestBed } from '@angular/core/testing';

import { KpiIpService } from './kpi-ip.service';

describe('KpiIpService', () => {
  let service: KpiIpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KpiIpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
