import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitCard } from './habit-card';

describe('HabitCard', () => {
  let component: HabitCard;
  let fixture: ComponentFixture<HabitCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitCard],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
