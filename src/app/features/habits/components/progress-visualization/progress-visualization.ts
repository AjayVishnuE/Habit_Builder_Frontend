import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-progress-visualization',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './progress-visualization.html',
    styleUrl: './progress-visualization.scss'
})
export class ProgressVisualization implements OnChanges {

    @Input() data: any[] = [];
    @Input() viewMode: 'week' | 'month' | 'year' = 'week';
    @Output() barSelected = new EventEmitter<any>();

    weekData: any[] = [];
    monthCalendar: any[] = [];
    yearData: any[] = [];
    yearMonths: string[] = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];

    selectedDate: string | null = null;

    // ========================================
    // DATA CHANGES
    // ========================================

    ngOnChanges(changes: SimpleChanges): void {

        if (
            changes['data'] ||
            changes['viewMode']
        ) {
            this.buildVisualization();
        }

    }


    // ========================================
    // MAIN BUILDER
    // ========================================

    private buildVisualization(): void {

        if (this.viewMode === 'week') {
            this.buildWeek();
        }

        else if (this.viewMode === 'month') {
            this.buildMonth();
        }

        else {
            this.buildYear();
        }

    }


    // ========================================
    // WEEK
    // ========================================

    private buildWeek(): void {

        if (!this.data.length) {
            this.weekData = [];
            return;
        }

        /*
         * The parent should provide the Monday of the
         * selected week as the first date.
         *
         * If data contains seven daily records,
         * use them directly.
         *
         * If a weekly habit currently provides only
         * one completion record, expand it into
         * Monday-Sunday here.
         */

        const firstDate = this.normalizeDate(
            new Date(this.data[0].date)
        );

        const monday = this.getMonday(firstDate);

        const result: any[] = [];

        for (let i = 0; i < 7; i++) {

            const date = new Date(monday);

            date.setDate(
                monday.getDate() + i
            );

            const dateKey = this.toDateKey(date);

            const existing = this.data.find(
                item =>
                    this.toDateKey(
                        new Date(item.date)
                    ) === dateKey
            );

            result.push({

                ...(existing || {}),

                date: dateKey,

                dayLabel: date.toLocaleDateString(
                    'en-US',
                    {
                        weekday: 'short'
                    }
                ),

                label: date.toLocaleDateString(
                    'en-US',
                    {
                        weekday: 'short'
                    }
                ),

                completed:
                    existing?.completed === true,

                mood:
                    existing?.mood || null

            });

        }

        this.weekData = result;

    }


    // ========================================
    // MONTH
    // ========================================

    private buildMonth(): void {

        if (!this.data.length) {
            this.monthCalendar = [];
            return;
        }

        const firstDate = this.normalizeDate(
            new Date(this.data[0].date)
        );

        const year = firstDate.getFullYear();

        const month = firstDate.getMonth();

        const firstDay = new Date(
            year,
            month,
            1
        );

        const daysInMonth = new Date(
            year,
            month + 1,
            0
        ).getDate();

        /*
         * JS:
         * Sunday = 0
         * Monday = 1
         *
         * Our calendar starts Monday,
         * therefore convert Sunday to 7.
         */

        let mondayOffset =
            firstDay.getDay() === 0
                ? 6
                : firstDay.getDay() - 1;


        const result: any[] = [];


        // Empty cells before day 1

        for (
            let i = 0;
            i < mondayOffset;
            i++
        ) {

            result.push({

                key: `empty-${i}`,

                empty: true

            });

        }


        // Actual days

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date = new Date(
                year,
                month,
                day
            );

            const dateKey =
                this.toDateKey(date);

            const existing =
                this.data.find(
                    item =>
                        this.toDateKey(
                            new Date(item.date)
                        ) === dateKey
                );

            result.push({

                ...(existing || {}),

                key: dateKey,

                date: dateKey,

                day,

                empty: false,

                completed:
                    existing?.completed === true,

                mood:
                    existing?.mood || null,

                isToday:
                    this.isToday(date)

            });

        }


        this.monthCalendar = result;

    }


    // ========================================
    // YEAR
    // ========================================

    private buildYear(): void {

        this.yearData = this.data.map(
            item => ({
                ...item,

                date:
                    this.toDateKey(
                        new Date(item.date)
                    )
            })
        );

    }


    // ========================================
    // SELECTION
    // ========================================

    select(item: any): void {

        if (!item || item.empty) {
            return;
        }

        this.selectedDate =
            this.toDateKey(
                new Date(item.date)
            );

        this.barSelected.emit(item);

    }


    // ========================================
    // BAR HEIGHT
    // ========================================

    getHeight(
        mood: string | null
    ): number {

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
                return 8;

        }

    }


    // ========================================
    // TOOLTIP
    // ========================================

    getTooltip(item: any): string {

        const date =
            new Date(item.date)
                .toLocaleDateString(
                    'en-US',
                    {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }
                );

        if (!item.completed) {

            return `${date} — Not completed`;

        }

        return `${date} — ${
            item.mood || 'Completed'
        }`;

    }


    // ========================================
    // DATE HELPERS
    // ========================================

    private normalizeDate(
        date: Date
    ): Date {

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    }


    private getMonday(
        date: Date
    ): Date {

        const result =
            this.normalizeDate(date);

        const day =
            result.getDay();

        const difference =
            day === 0
                ? -6
                : 1 - day;

        result.setDate(
            result.getDate() + difference
        );

        return result;

    }


    private toDateKey(
        date: Date
    ): string {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0');

        const day =
            String(
                date.getDate()
            ).padStart(2, '0');

        return `${year}-${month}-${day}`;

    }


    private isToday(
        date: Date
    ): boolean {

        const today =
            new Date();

        return (
            this.toDateKey(date) ===
            this.toDateKey(today)
        );

    }

}