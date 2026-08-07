import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressVisualization } from './progress-visualization';

describe('ProgressVisualization', () => {
  let component: ProgressVisualization;
  let fixture: ComponentFixture<ProgressVisualization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressVisualization],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressVisualization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
