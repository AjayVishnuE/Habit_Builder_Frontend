import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitDetails } from './habit-details';

describe('HabitDetails', () => {
  let component: HabitDetails;
  let fixture: ComponentFixture<HabitDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
