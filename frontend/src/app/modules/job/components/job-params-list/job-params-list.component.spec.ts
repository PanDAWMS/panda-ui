import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobParamsListComponent } from './job-params-list.component';

describe('JobParamsListComponent', () => {
  let component: JobParamsListComponent;
  let fixture: ComponentFixture<JobParamsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobParamsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JobParamsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
