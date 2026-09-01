import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksAndNotes } from './tasks-and-notes';

describe('TasksAndNotes', () => {
  let component: TasksAndNotes;
  let fixture: ComponentFixture<TasksAndNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksAndNotes],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksAndNotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
