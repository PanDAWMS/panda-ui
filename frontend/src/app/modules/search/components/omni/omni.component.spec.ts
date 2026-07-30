import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SearchOmniComponent } from './omni.component';

describe('SearchOmniComponent', () => {
  let component: SearchOmniComponent;
  let fixture: ComponentFixture<SearchOmniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchOmniComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchOmniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
