import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { Tasks } from '../../components/tasks/tasks';
import { Notes } from '../../components/notes/notes';

@Component({
  selector: 'app-tasks-and-notes',
  standalone: true,
  imports: [
    MatTabsModule,
    Tasks,
    Notes
  ],
  templateUrl: './tasks-and-notes.html',
  styleUrl: './tasks-and-notes.scss'
})
export class TasksAndNotes {

}