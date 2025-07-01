import { TestBed } from '@angular/core/testing';

import { CoutService } from './cout.service';

describe('CoutService', () => {
  let service: CoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
