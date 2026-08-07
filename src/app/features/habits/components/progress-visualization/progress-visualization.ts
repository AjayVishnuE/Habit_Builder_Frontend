import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-visualization.html',
  styleUrl: './progress-visualization.scss'
})
export class ProgressVisualization {
  @Input() data: any[] = [];
  @Input() viewMode: 'week' | 'month' | 'year' = 'week';
  @Output() barSelected = new EventEmitter<any>();

  select(item: any) {
    this.barSelected.emit(item);
  }

  getHeight(mood: string | null): number {
    switch (mood) {
      case 'Excellent':
        return 100;
      case 'Great':
        return 85;
      case 'Good':
        return 70;
      case 'Okay':
        return 50;
      case 'Bad':
        return 30;
      default:
        return 15;
    }
  }
}