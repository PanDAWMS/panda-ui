import { TestBed } from '@angular/core/testing';
import { JobErrorCategoriesService } from './job-error-categories.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JobErrorCategory } from '../models/job-error-category.model';
import { firstValueFrom } from 'rxjs';

describe('JobErrorCategoriesService', () => {
  let service: JobErrorCategoriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobErrorCategoriesService, provideHttpClientTesting()],
    });
    service = TestBed.inject(JobErrorCategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch categories and assign colors', async () => {
    const mockCategories: JobErrorCategory[] = [
      { id: 1, name: 'Cat 1' },
      { id: 2, name: 'Cat 2' },
      { id: 3, name: 'Cat 3' },
    ];

    // Call the service
    const promise = firstValueFrom(service.getJobErrorCategories());

    // Intercept the request and flush mock data
    const req = httpMock.expectOne((req) => req.url.endsWith('job/error-categories/'));
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);

    const categories = await promise;

    // Data length
    expect(categories.length).toBe(3);

    // Original data preserved
    expect(categories.map((c) => c.name)).toEqual(['Cat 1', 'Cat 2', 'Cat 3']);

    // Colors assigned
    categories.forEach((c, i) => {
      expect(c.color).toBe(service['palette'][i]);
    });

    // Cached version should return immediately
    const cached = await firstValueFrom(service.getJobErrorCategories());
    expect(cached).toBe(categories); // same object
  });
});
