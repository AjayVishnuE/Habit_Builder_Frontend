import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';

@Component({
    selector: 'app-habit-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './habit-details.html',
    styleUrl: './habit-details.scss'
})
export class HabitDetails implements OnInit {

    private route = inject(ActivatedRoute);
    private habitService = inject(HabitService);
    private cdr = inject(ChangeDetectorRef);

    habit?: Habit;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            return;
        }
        this.habitService.getHabitById(id).subscribe({
            next: habit => {
                this.habit = habit;
                this.cdr.detectChanges();
            },
            error: err => console.error(err)
        });
    }
}