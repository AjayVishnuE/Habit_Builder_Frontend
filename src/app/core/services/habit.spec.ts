import { TestBed } from '@angular/core/testing';

import { Habit } from './habit.service';

describe('Habit', () => {
  let service: Habit;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Habit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
