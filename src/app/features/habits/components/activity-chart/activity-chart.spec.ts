import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityChart } from './activity-chart';

describe('ActivityChart', () => {
  let component: ActivityChart;
  let fixture: ComponentFixture<ActivityChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityChart],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
