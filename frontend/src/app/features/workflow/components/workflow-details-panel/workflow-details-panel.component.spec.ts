import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkflowDetailsPanelComponent } from './workflow-details-panel.component';
import { WorkflowItem } from '../../workflow.model';

describe('WorkflowDetailsPanelComponent', () => {
  let component: WorkflowDetailsPanelComponent;
  let fixture: ComponentFixture<WorkflowDetailsPanelComponent>;

  const mockWorkflow: WorkflowItem = {
    workflow_id: 1,
    name: 'Test workflow',
    status: 'done',
    creation_time: '2026-09-17T10:00:00Z',
    start_time: '2026-09-17T10:01:00Z',
    end_time: '2026-09-17T10:05:00Z',
    total_steps: 4,
    pending_steps: 0,
    active_steps: 0,
    completed_steps: 4,
    failed_steps: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowDetailsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailsPanelComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('workflow', mockWorkflow);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
