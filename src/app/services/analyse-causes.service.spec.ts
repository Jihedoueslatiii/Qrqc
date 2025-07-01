import { TestBed } from '@angular/core/testing';

import { AnalyseCausesService } from './analyse-causes.service';

describe('AnalyseCausesService', () => {
  let service: AnalyseCausesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyseCausesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
