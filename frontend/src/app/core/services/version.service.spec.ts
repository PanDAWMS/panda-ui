import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { VersionService } from './version.service';

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
