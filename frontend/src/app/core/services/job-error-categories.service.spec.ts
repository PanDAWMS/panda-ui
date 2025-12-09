import { TestBed } from '@angular/core/testing';

import { JobErrorCategoriesService } from './job-error-categories.service';

describe('JobErrorCategoriesService', () => {
  let service: JobErrorCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobErrorCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
