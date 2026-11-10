import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetSummaryComponent } from './dataset-summary.component';

describe('DatasetSummaryComponent', () => {
  let component: DatasetSummaryComponent;
  let fixture: ComponentFixture<DatasetSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
