import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteHabitDialog } from './complete-habit-dialog';

describe('CompleteHabitDialog', () => {
  let component: CompleteHabitDialog;
  let fixture: ComponentFixture<CompleteHabitDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteHabitDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteHabitDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
