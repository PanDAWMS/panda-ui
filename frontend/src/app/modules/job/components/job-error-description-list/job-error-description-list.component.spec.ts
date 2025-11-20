import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobErrorDescriptionListComponent } from './job-error-description-list.component';

describe('JobErrorDescriptionListComponent', () => {
  let component: JobErrorDescriptionListComponent;
  let fixture: ComponentFixture<JobErrorDescriptionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobErrorDescriptionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobErrorDescriptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
