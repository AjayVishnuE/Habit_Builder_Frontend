import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef} from '@angular/core';

import { Habit } from '../../../../core/models/habit.model';
import { ActivityPoint } from '../../../../core/models/activity-chart.model';
import { buildDailyChart, buildWeeklyChart, buildMonthlyChart } from '../../../../core/utils/activity-chart.util';

@Component({
  selector: 'app-activity-chart',
  imports: [],
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.sass',
})
export class ActivityChart implements OnChanges {
  @Input({ required: true }) habit!: Habit;
  @Input() view: 'week' | 'month' = 'week';
  @Input() showHeatMap = false;
  public points: ActivityPoint[] = [];

  ngOnChanges(): void {
    if (!this.habit) {
      return;
    }
    switch (this.habit.frequency) {
      case 'Daily':
        this.points = buildDailyChart( this.habit, this.view );
        break;
      case 'Weekly':
        this.points = buildWeeklyChart( this.habit );
        break;
      case 'Monthly':
        this.points = buildMonthlyChart( this.habit );
        break;
    }
  }
}
