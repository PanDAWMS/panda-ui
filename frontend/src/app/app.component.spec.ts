import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter, RouterOutlet } from '@angular/router';

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterOutlet],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'PanDA UI' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('PanDA UI');
  });
});
