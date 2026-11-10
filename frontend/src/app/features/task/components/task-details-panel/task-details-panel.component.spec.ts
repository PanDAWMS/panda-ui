import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsPanelComponent } from './task-details-panel.component';

describe('TaskDetailsPanelComponent', () => {
  let component: TaskDetailsPanelComponent;
  let fixture: ComponentFixture<TaskDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
