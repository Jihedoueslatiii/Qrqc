import { TestBed } from '@angular/core/testing';

import { OtdService } from './otd.service';

describe('OtdService', () => {
  let service: OtdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
