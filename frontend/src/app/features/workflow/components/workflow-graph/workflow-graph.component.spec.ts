import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowGraphComponent } from './workflow-graph.component';
import { LoggingService } from '../../../../core/services/logging.service';
import { Router } from '@angular/router';
import { StepDetail } from '../../workflow.model';
import { Component, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { GraphComponent } from '@swimlane/ngx-graph';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

// Mock ngx-graph component containing all bindings present in the component template
@Component({
  selector: 'ngx-graph',
  standalone: true,
  template: '<ng-content></ng-content>',
  schemas: [NO_ERRORS_SCHEMA],
})
class MockNgxGraphComponent {
  nodes = input<any[]>([]);
  links = input<any[]>([]);
  zoomToFit$ = input<any>();
  center$ = input<any>();
  update$ = input<any>();
  panToNode$ = input<any>();
  layout = input<any>();
  autoZoom = input<boolean>(false);
  autoCenter = input<boolean>(false);
  panningEnabled = input<boolean>(true);
  enableBackdrop = input<boolean>(false);
  enableDrag = input<boolean>(false);
  draggingEnabled = input<boolean>(false);
  curve = input<any>();
}

describe('WorkflowGraphComponent', () => {
  let component: WorkflowGraphComponent;
  let fixture: ComponentFixture<WorkflowGraphComponent>;

  const mockLoggingService = {
    forContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }),
  };

  const mockRouter = {
    navigate: vi.fn(),
  };

  const sampleSteps: StepDetail[] = [
    {
      flavor: 'panda_task',
      target_id: 101,
      status: 'RUNNING',
      definition_json: {
        id: 1,
        member_id: 'parent_member',
        name: 'Step One',
        inputs: {},
        outputs: {},
        parents: [],
      },
    } as any,
    {
      flavor: 'custom_step',
      target_id: null,
      status: 'COMPLETED',
      definition_json: {
        id: 2,
        member_id: 'child_member',
        name: 'Step Two',
        inputs: {
          input1: { parent_id: 'parent_member', source: 'dataset/output_files' },
        },
        outputs: {},
        parents: [1],
      },
    } as any,
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [WorkflowGraphComponent],
      providers: [
        { provide: LoggingService, useValue: mockLoggingService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(WorkflowGraphComponent, {
        remove: { imports: [GraphComponent] },
        add: { imports: [MockNgxGraphComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkflowGraphComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(mockLoggingService.forContext).toHaveBeenCalledWith('WorkflowGraphComponent');
  });

  describe('Nodes Computed Signal', () => {
    it('should compute nodes correctly based on input steps', () => {
      fixture.componentRef.setInput('steps', sampleSteps);

      const nodes = component.nodes();
      expect(nodes.length).toBe(2);

      expect(nodes[0]).toEqual({
        id: '1',
        label: 'Step One',
        data: {
          flavor: 'panda_task',
          status: 'running',
          inputs: {},
          outputs: {},
          task_id: 101,
          dynamicColor: 'var(--status-running-color)',
        },
      });

      expect(nodes[1].data.flavor).toBe('custom_step');
      expect(nodes[1].data.task_id).toBeNull();
      expect(nodes[1].data.status).toBe('completed');
    });

    it('should fallback to neutral status if step.status is missing', () => {
      const stepWithoutStatus: StepDetail[] = [
        {
          flavor: 'basic',
          definition_json: { id: 10, name: 'No Status' },
        } as any,
      ];

      fixture.componentRef.setInput('steps', stepWithoutStatus);

      const nodes = component.nodes();
      expect(nodes[0].data.status).toBe('neutral');
      expect(nodes[0].data.dynamicColor).toBe('var(--status-neutral-color)');
    });
  });

  describe('Edges Computed Signal', () => {
    it('should compute edges with parsed labels correctly', () => {
      fixture.componentRef.setInput('steps', sampleSteps);

      const edges = component.edges();
      expect(edges.length).toBe(1);

      expect(edges[0]).toEqual({
        id: 'e_1_2',
        source: '1',
        target: '2',
        label: 'output_files',
      });
    });

    it('should fallback edge label to parent name if no matched input with slash is found', () => {
      const stepsNoSlash: StepDetail[] = [
        {
          definition_json: { id: 1, member_id: 'p1', name: 'Parent Step' },
        } as any,
        {
          definition_json: {
            id: 2,
            member_id: 'c1',
            name: 'Child Step',
            parents: [1],
            inputs: {
              in1: { parent_id: 'p1', source: 'plain_label' },
            },
          },
        } as any,
      ];

      fixture.componentRef.setInput('steps', stepsNoSlash);

      const edges = component.edges();
      expect(edges[0].label).toBe('plain_label');
    });

    it('should return empty edges if there are no parents', () => {
      const standaloneSteps: StepDetail[] = [{ definition_json: { id: 1, name: 'A', parents: [] } } as any];

      fixture.componentRef.setInput('steps', standaloneSteps);
      expect(component.edges()).toEqual([]);
    });
  });

  describe('getNodeTooltipText', () => {
    it('should return formatted tooltip text for valid node', () => {
      const node = {
        id: '1',
        data: {
          flavor: 'panda_task',
          task_id: 55,
          status: 'running',
        },
      } as any;

      const tooltip = component.getNodeTooltipText(node);
      expect(tooltip).toContain('Step #1');
      expect(tooltip).toContain('Flavor: panda_task #55');
      expect(tooltip).toContain('Status: running');
    });

    it('should handle missing data gracefully', () => {
      expect(component.getNodeTooltipText(null as any)).toBe('');
      expect(component.getNodeTooltipText({ id: '1' } as any)).toBe('');
    });
  });

  describe('onNodeClick', () => {
    it('should navigate to task page when clicked node is a panda_task with task_id', () => {
      const node = {
        data: {
          flavor: 'panda_task',
          task_id: 999,
        },
      } as any;

      component.onNodeClick(node);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/task/', 999], {
        queryParams: { returnToWorkflow: 'true' },
      });
    });

    it('should not navigate if node is not a panda_task or lacks task_id', () => {
      const node = {
        data: {
          flavor: 'custom_step',
          task_id: null,
        },
      } as any;

      component.onNodeClick(node);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('refreshGraphLayout & Effect', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should trigger zoomToFit$ and center$ Subjects after timeout', () => {
      const zoomSpy = vi.fn();
      const centerSpy = vi.fn();

      component.zoomToFit$.subscribe(zoomSpy);
      component.center$.subscribe(centerSpy);

      component.refreshGraphLayout();

      vi.advanceTimersByTime(200);
      expect(zoomSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(zoomSpy).toHaveBeenCalledWith({ force: true, autoCenter: true });
      expect(centerSpy).toHaveBeenCalledWith(true);
    });

    it('should trigger layout refresh when steps input signal changes with data', () => {
      const spy = vi.spyOn(component, 'refreshGraphLayout');

      fixture.componentRef.setInput('steps', sampleSteps);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(300);
    });
  });
});
