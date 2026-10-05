import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowOverviewComponent } from './workflow-overview.component';
import { Router } from '@angular/router';
import { Component, input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { WorkflowDetailsPanelComponent } from '../workflow-details-panel/workflow-details-panel.component';
import { describe, beforeEach, it, expect, vi } from 'vitest';

// Stub child component to isolate WorkflowOverviewComponent unit tests
@Component({
  selector: 'app-workflow-details-panel',
  standalone: true,
  template: '',
})
class MockWorkflowDetailsPanelComponent {
  id = input<string>();
  closable = input<boolean>();
}

describe('WorkflowOverviewComponent', () => {
  let component: WorkflowOverviewComponent;
  let fixture: ComponentFixture<WorkflowOverviewComponent>;

  const mockRouter = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowOverviewComponent],
      providers: [{ provide: Router, useValue: mockRouter }],
    })
      // Override the actual child component with our stub
      .overrideComponent(WorkflowOverviewComponent, {
        remove: { imports: [WorkflowDetailsPanelComponent] },
        add: { imports: [MockWorkflowDetailsPanelComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkflowOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    // Pass required input signal to prevent runtime errors
    fixture.componentRef.setInput('id', 'workflow-123');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should pass correct bindings to app-workflow-details-panel', () => {
    const testId = 'wf-test-999';

    // Set required input signal
    fixture.componentRef.setInput('id', testId);
    fixture.detectChanges();

    // Query child component debug element
    const panelEl = fixture.debugElement.query(By.directive(MockWorkflowDetailsPanelComponent));
    expect(panelEl).toBeTruthy();

    const panelInstance = panelEl.componentInstance as MockWorkflowDetailsPanelComponent;

    // Verify input bindings
    expect(panelInstance.id()).toBe(testId);
    expect(panelInstance.closable()).toBe(false);
  });
});
