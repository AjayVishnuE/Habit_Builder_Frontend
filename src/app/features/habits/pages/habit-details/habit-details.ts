import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HabitService } from '../../../../core/services/habit.service';
import { Habit } from '../../../../core/models/habit.model';

@Component({
    selector: 'app-habit-details',
    standalone: true,
    imports: [],
    templateUrl: './habit-details.html',
    styleUrl: './habit-details.scss'
})
export class HabitDetails implements OnInit {

    private route = inject(ActivatedRoute);
    private habitService = inject(HabitService);

    habit?: Habit;

    ngOnInit(): void {

        const id = this.route.snapshot.paramMap.get('id');

        if (!id) {
            return;
        }

        this.habitService.getHabitById(id).subscribe({

            next: habit => {
                this.habit = habit;
            },

            error: err => {
                console.error(err);
            }

        });

    }

}