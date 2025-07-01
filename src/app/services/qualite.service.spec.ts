import { TestBed } from '@angular/core/testing';

import { QualiteService } from './qualite.service';

describe('QualiteService', () => {
  let service: QualiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QualiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
