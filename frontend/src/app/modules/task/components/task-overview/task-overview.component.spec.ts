import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskOverviewComponent } from './task-overview.component';
import { provideRouter } from '@angular/router';

describe('TaskOverviewComponent', () => {
  let component: TaskOverviewComponent;
  let fixture: ComponentFixture<TaskOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskOverviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
