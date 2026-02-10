import { TestBed } from '@angular/core/testing';

import { MessageBufferService } from './message-buffer.service';

describe('MessageBufferService', () => {
  let service: MessageBufferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageBufferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
