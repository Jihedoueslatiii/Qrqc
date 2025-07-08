import { TestBed } from '@angular/core/testing';

import { GeminiApiServiceService } from './gemini-api-service.service';

describe('GeminiApiServiceService', () => {
  let service: GeminiApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
