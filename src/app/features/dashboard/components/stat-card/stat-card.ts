import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';


export interface ActivityItem {
  date: Date;
  label: string;
  count: number;
  completed: boolean;
  items: any[];
  isFuture: boolean;
}


type ViewMode = 'week' | 'month' | 'year';

type ActivityType = 'habits' | 'tasks';


@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCard implements OnChanges {

  @Input() data: ActivityItem[] = [];

  @Input() viewMode: ViewMode = 'week';

  @Input() maxValue = 1;

  @Input() type: ActivityType = 'tasks';

  @Output() itemSelected =
    new EventEmitter<ActivityItem>();


  calendarCells: (ActivityItem | null)[] = [];


  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['data'] ||
      changes['viewMode']
    ) {

      this.buildCalendarCells();

    }

  }


  // ============================================================
  // WEEK
  // ============================================================

  getBarHeight(
    count: number
  ): number {

    if (count <= 0) {
      return 5;
    }

    const percentage =
      (count / Math.max(this.maxValue, 1)) * 100;

    return Math.max(
      14,
      Math.min(100, percentage)
    );

  }


  selectItem(
    item: ActivityItem
  ): void {

    if (item.isFuture) {
      return;
    }

    this.itemSelected.emit(item);

  }


  // ============================================================
  // MONTH / YEAR CALENDAR
  // ============================================================

  private buildCalendarCells(): void {

    if (!this.data.length) {

      this.calendarCells = [];

      return;

    }


    const firstDate =
      new Date(this.data[0].date);

    const offset =
      (firstDate.getDay() + 6) % 7;


    const cells: (ActivityItem | null)[] =
      Array.from(
        { length: offset },
        () => null
      );


    cells.push(...this.data);


    if (this.viewMode === 'year') {

      const remainder =
        cells.length % 7;

      if (remainder !== 0) {

        const trailing =
          7 - remainder;

        for (
          let i = 0;
          i < trailing;
          i++
        ) {

          cells.push(null);

        }

      }

    }


    this.calendarCells = cells;

  }


  // ============================================================
  // INTENSITY
  // ============================================================

  getLevel(
    item: ActivityItem
  ): number {

    if (
      item.count <= 0 ||
      this.maxValue <= 0
    ) {
      return 0;
    }

    const ratio =
      item.count / this.maxValue;


    if (ratio >= 0.8) {
      return 4;
    }

    if (ratio >= 0.55) {
      return 3;
    }

    if (ratio >= 0.3) {
      return 2;
    }

    return 1;

  }


  // ============================================================
  // TOOLTIP
  // ============================================================

  getTooltip(
    item: ActivityItem
  ): string {

    const date =
      item.date.toLocaleDateString(
        'en-US',
        {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }
      );


    if (item.isFuture) {

      return `${date} — Future date`;

    }


    if (item.count === 0) {

      return `${date} — No ${this.type} completed`;

    }


    const label =
      this.type === 'habits'
        ? item.count === 1
          ? 'habit completed'
          : 'habits completed'
        : item.count === 1
          ? 'task completed'
          : 'tasks completed';


    return `${date} — ${item.count} ${label}`;

  }


  // ============================================================
  // EMPTY
  // ============================================================

  get isEmpty(): boolean {

    return !this.data.length;

  }

}