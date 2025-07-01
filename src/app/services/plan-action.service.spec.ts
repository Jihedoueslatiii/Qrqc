import { TestBed } from '@angular/core/testing';

import { PlanActionService } from './plan-action.service';

describe('PlanActionService', () => {
  let service: PlanActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
