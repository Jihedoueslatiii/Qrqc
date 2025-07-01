import { TestBed } from '@angular/core/testing';

import { SharedKpiService } from './shared-kpi.service';

describe('SharedKpiService', () => {
  let service: SharedKpiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedKpiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
