import { TestBed } from '@angular/core/testing';

import { AnomalyServiceService } from './anomaly-service.service';

describe('AnomalyServiceService', () => {
  let service: AnomalyServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnomalyServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
