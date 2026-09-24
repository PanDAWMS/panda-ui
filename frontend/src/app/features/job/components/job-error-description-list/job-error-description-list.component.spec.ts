import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { JobErrorDescriptionListComponent } from './job-error-description-list.component';
import { ApiService } from '../../../../core/services/api.service';
import { JobErrorCategoriesService } from '../../job-error-categories.service';

describe('JobErrorDescriptionListComponent', () => {
  let component: JobErrorDescriptionListComponent;
  let fixture: ComponentFixture<JobErrorDescriptionListComponent>;

  const apiServiceMock = {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  };

  const jobErrorCategoriesServiceMock = {
    getJobErrorCategories: vi.fn(),
  };

  beforeEach(async () => {
    apiServiceMock.get.mockReturnValue(of([]));

    jobErrorCategoriesServiceMock.getJobErrorCategories.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [JobErrorDescriptionListComponent],
      providers: [
        {
          provide: ApiService,
          useValue: apiServiceMock,
        },
        {
          provide: JobErrorCategoriesService,
          useValue: jobErrorCategoriesServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobErrorDescriptionListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
