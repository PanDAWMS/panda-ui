import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { WorkflowDetailsPanelComponent } from './workflow-details-panel.component';
import { WorkflowService } from '../../workflow.service';
import { Router } from '@angular/router';
import { WorkflowGraphComponent } from '../workflow-graph/workflow-graph.component';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { WorkflowDetail } from '../../workflow.model';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

// 1. Updated Mock Component to include all inputs used in the template (showLegend, counts, etc.)
@Component({
  selector: 'app-workflow-graph',
  standalone: true,
  template: '',
})
class MockWorkflowGraphComponent {
  steps = input<any[]>([]);
}

@Component({
  selector: 'app-progress-bar-segmented',
  standalone: true,
  template: '',
})
class MockProgressBarSegmentedComponent {
  counts = input<any[]>([]);
  showLegend = input<boolean>(true);
}

describe('WorkflowDetailsPanelComponent', () => {
  let component: WorkflowDetailsPanelComponent;
  let fixture: ComponentFixture<WorkflowDetailsPanelComponent>;

  let mockWorkflowService: { getWorkflowById: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const mockWorkflowDetail: WorkflowDetail = {
    id: 101,
    name: 'Test Workflow',
    step_summary: {
      pending_steps: 2,
      active_steps: 1,
      completed_steps: 5,
      failed_steps: 0,
    },
    file_summary: {
      files_total: 100,
      files_finished: 80,
      files_failed: 5,
      files_missing: 5,
      files_waiting: 5,
    },
  } as unknown as WorkflowDetail;

  beforeEach(async () => {
    mockWorkflowService = {
      getWorkflowById: vi.fn().mockReturnValue(of(mockWorkflowDetail)),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [WorkflowDetailsPanelComponent],
      providers: [
        { provide: WorkflowService, useValue: mockWorkflowService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(WorkflowDetailsPanelComponent, {
        remove: {
          imports: [WorkflowGraphComponent, ProgressBarSegmentedComponent],
        },
        add: {
          imports: [MockWorkflowGraphComponent, MockProgressBarSegmentedComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailsPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('id', '101');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('rxResource & Data Fetching', () => {
    it('should convert string id input to numeric effectiveWorkflowId and fetch workflow details', () => {
      fixture.componentRef.setInput('id', '101');
      fixture.detectChanges();

      expect(component.effectiveWorkflowId()).toBe(101);
      expect(mockWorkflowService.getWorkflowById).toHaveBeenCalledWith(101);
      expect(component.details()).toEqual(mockWorkflowDetail);
    });

    it('should evaluate effectiveWorkflowId as null and return null resource when id is non-numeric or invalid', () => {
      fixture.componentRef.setInput('id', 'abc');
      fixture.detectChanges();

      expect(component.effectiveWorkflowId()).toBeNull();
      expect(mockWorkflowService.getWorkflowById).not.toHaveBeenCalled();
      expect(component.details()).toBeNull();
    });

    it('should expose error signal state when WorkflowService fails', () => {
      const apiError = new Error('Workflow not found');
      mockWorkflowService.getWorkflowById.mockReturnValue(throwError(() => apiError));

      fixture.componentRef.setInput('id', '500');

      // 2. Wrap detectChanges() in expect().toThrow() because rxResource.value() throws when errored
      expect(() => fixture.detectChanges()).toThrow();

      expect(component.error()).toEqual(apiError);
    });
  });

  describe('Summaries Computation', () => {
    it('should compute stepSummary accurately from detailsResource value', () => {
      fixture.componentRef.setInput('id', '101');
      fixture.detectChanges();

      const steps = component.stepSummary();
      expect(steps).toEqual([
        { status: 'pending', count: 2 },
        { status: 'active', count: 1 },
        { status: 'done', count: 5 },
        { status: 'failed', count: 0 },
      ]);
    });

    it('should compute fileSummary accurately including pending calculation', () => {
      fixture.componentRef.setInput('id', '101');
      fixture.detectChanges();

      // total (100) - failed (5) - finished (80) - missing (5) - waiting (5) = 5
      const files = component.fileSummary();
      expect(files).toEqual([
        { status: 'pending', count: 5 },
        { status: 'finished', count: 80 },
        { status: 'failed', count: 5 },
        { status: 'missing', count: 5 },
        { status: 'waiting', count: 5 },
      ]);
    });

    it('should return empty stepSummary and fileSummary arrays when details are empty', () => {
      mockWorkflowService.getWorkflowById.mockReturnValue(of(null));

      fixture.componentRef.setInput('id', '200');
      fixture.detectChanges();

      expect(component.stepSummary()).toEqual([]);
      expect(component.fileSummary()).toEqual([]);
    });
  });

  describe('onClose Action', () => {
    it('should emit close output event and navigate to /workflows on onClose()', () => {
      fixture.componentRef.setInput('id', '101');
      fixture.detectChanges();

      const closeSpy = vi.fn();
      component.close.subscribe(closeSpy);

      component.onClose();

      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/workflows']);
    });
  });
});
