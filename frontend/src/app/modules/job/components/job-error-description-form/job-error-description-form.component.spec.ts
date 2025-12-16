import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobErrorDescriptionFormComponent } from './job-error-description-form.component';

describe('JobErrorDescriptionFormComponent', () => {
  let component: JobErrorDescriptionFormComponent;
  let fixture: ComponentFixture<JobErrorDescriptionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobErrorDescriptionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JobErrorDescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
