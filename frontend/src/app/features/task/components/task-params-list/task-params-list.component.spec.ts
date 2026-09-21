import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskParamsListComponent } from './task-params-list.component';

describe('TaskParamsListComponent', () => {
  let component: TaskParamsListComponent;
  let fixture: ComponentFixture<TaskParamsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskParamsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskParamsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
