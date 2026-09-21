import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProgressBarSegmentedComponent } from './progress-bar-segmented.component';
import { StatusCount } from '../../models/status.model';

describe('ProgressBarSegmentedComponent', () => {
  let component: ProgressBarSegmentedComponent;
  let fixture: ComponentFixture<ProgressBarSegmentedComponent>;

  const mockCounts: StatusCount[] = [
    { status: 'done', count: 4 },
    { status: 'failed', count: 4 },
    { status: 'pending', count: 4 },
    { status: 'active', count: 4 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarSegmentedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarSegmentedComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('counts', mockCounts);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
