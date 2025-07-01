import { TestBed } from '@angular/core/testing';

import { DelaiService } from './delai.service';

describe('DelaiService', () => {
  let service: DelaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DelaiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
