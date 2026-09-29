import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { TaskService } from '../../../../core/services/task.service';

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskDay {
  date: Date;
  tasks: Task[];
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class Tasks implements OnInit {

  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);

  taskDays: TaskDay[] = [];
  allTasks: Task[] = [];
  loading = true;

  /* =========================
     NORMAL ADD
  ========================= */

  addingTaskFor: string | null = null;

  newTaskTitle = '';
  newTaskPriority: 'Low' | 'Medium' | 'High' = 'Medium';
  addingTaskSaving = false; 
  /* =========================
     FUTURE TASKS
  ========================= */

  showUpcomingTasks = false;
  addingFutureTask = false;

  futureTaskTitle = '';
  futureTaskPriority: 'Low' | 'Medium' | 'High' = 'Medium';
  futureTaskDate = '';

  /* =========================
     EDIT
  ========================= */

  expandedTaskId: string | null = null;
  togglingTaskId: string | null = null;
  taskToggleError = '';
  editedTask: Task | null = null;
  savingTaskId: string | null = null;
  deleteConfirmationTask: Task | null = null;

  // =========================
  // MOVE PAST TASKS TO TODAY
  // =========================

  movePastTasksChecked = false;
  showMovePastTasksConfirmation = false;
  movingPastTasks = false;

  ngOnInit(): void {
    this.loadTasks();
  }

  /* =========================
     LOAD
  ========================= */

  loadTasks(): void {
    this.loading = true;

    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        // Always keep the complete dataset.
        this.allTasks = tasks;

        // Build the currently visible timeline from all tasks.
        this.buildTaskDays(this.allTasks);

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load tasks:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /* =========================
     BUILD DAY GROUPS
  ========================= */

  buildTaskDays(tasks: Task[]): void  {
    const grouped = new Map<string, Task[]>();

    tasks.forEach(task => {
      if (!task.dueDate) {
        return;
      }

      const dateKey = this.getDateKey(task.dueDate);

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }

      grouped.get(dateKey)!.push(task);
    });

    const today = this.startOfDay(new Date());

    let dates = Array.from(grouped.keys())
      .map(key => this.parseDateKey(key));

    if (this.showUpcomingTasks) {

      /*
       * Upcoming mode:
       * Future → Today → Past
       */
      dates = dates.sort((a, b) => b.getTime() - a.getTime());
      this.cdr.detectChanges();

    } else {

      /*
       * Normal mode:
       * Today → Yesterday → Older
       *
       * Future dates are hidden.
       */
      dates = dates
        .filter(date => date.getTime() <= today.getTime())
        .sort((a, b) => b.getTime() - a.getTime());
    }

    this.taskDays = dates.map(date => ({
      date,
      tasks: grouped.get(this.getDateKey(date.toISOString())) || []
    }));

    /*
     * Always show Today in normal mode.
     */
    if (
      !this.showUpcomingTasks &&
      !this.taskDays.some(day => this.isToday(day.date))
    ) {
      this.taskDays.unshift({
        date: today,
        tasks: []
      });
      this.cdr.detectChanges();
    }
    this.cdr.detectChanges();
  }

  /* =========================
     DATE HELPERS
  ========================= */

  getDateKey(dateValue: string): string {
    const date = new Date(dateValue);

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  private parseDateKey(key: string): Date {
    const [year, month, day] = key.split('-').map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
  }

  isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  isFuture(date: Date): boolean {
    return this.startOfDay(date).getTime() >
      this.startOfDay(new Date()).getTime();
  }

  getDayLabel(date: Date): string {

    if (this.isToday(date)) {
      return 'Today';
    }

    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return 'Yesterday';
    }

    if (this.isFuture(date)) {
      const tomorrow = new Date();

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      if (
        date.getFullYear() === tomorrow.getFullYear() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getDate() === tomorrow.getDate()
      ) {
        return 'Tomorrow';
      }
    }

    return date.toLocaleDateString(
      'en-US',
      {
        weekday: 'long'
      }
    );
  }

  getFullDate(date: Date): string {
    return date.toLocaleDateString(
      'en-US',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  }

  /* =========================
     UPCOMING TOGGLE
  ========================= */

  toggleUpcomingTasks(): void {
    this.showUpcomingTasks = !this.showUpcomingTasks;

    this.addingTaskFor = null;
    this.addingFutureTask = false;

    // Rebuild from ALL tasks, not only the currently visible days.
    this.buildTaskDays(this.allTasks);

    this.cdr.detectChanges();
  }

  /* =========================
     NORMAL ADD TASK
  ========================= */

  openAddTask(date: Date): void {

    /*
     * Future dates are intentionally added through
     * the dedicated "Add future task" flow.
     */
    if (this.isFuture(date)) {
      return;
    }

    this.addingFutureTask = false;

    this.addingTaskFor =
      this.getDateKey(date.toISOString());

    this.newTaskTitle = '';
    this.newTaskPriority = 'Medium';
  }

  cancelAddTask(): void {
    this.addingTaskFor = null;
    this.newTaskTitle = '';
  }

  saveNewTask(date: Date): void {

    const title = this.newTaskTitle.trim();

    if (!title || this.addingTaskSaving) {
      return;
    }

    this.addingTaskSaving = true;

    const task = {
      title,
      description: '',
      dueDate: date.toISOString(),
      priority: this.newTaskPriority,
      completed: false
    };

    this.taskService.createTask(task).subscribe({

      next: () => {

        this.addingTaskSaving = false;

        this.cancelAddTask();

        this.loadTasks();
      },

      error: (error) => {

        console.error(
          'Failed to create task:',
          error
        );

        this.addingTaskSaving = false;

        this.cdr.detectChanges();
      }
    });
  }

  /* =========================
     FUTURE TASK
  ========================= */

  getTomorrowKey(): string {
    const tomorrow = new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    return this.getDateInputValue(tomorrow);
  }

  private getDateInputValue(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  openFutureTask(): void {
    this.addingTaskFor = null;

    this.addingFutureTask = true;

    this.futureTaskTitle = '';
    this.futureTaskPriority = 'Medium';

    /*
     * Default future date = tomorrow.
     */
    this.futureTaskDate = this.getTomorrowKey();
  }

  cancelFutureTask(): void {
    this.addingFutureTask = false;
    this.futureTaskTitle = '';
    this.futureTaskDate = '';
    this.futureTaskPriority = 'Medium';
  }

  saveFutureTask(): void {

    const title = this.futureTaskTitle.trim();

    if (!title || !this.futureTaskDate) {
      return;
    }

    const selectedDate = this.parseDateKey(
      this.futureTaskDate
    );

    const today = this.startOfDay(
      new Date()
    );

    /*
     * Safety check:
     * future flow can only create tomorrow onwards.
     */
    if (selectedDate.getTime() <= today.getTime()) {
      return;
    }

    const task = {
      title,
      description: '',
      dueDate: selectedDate.toISOString(),
      priority: this.futureTaskPriority,
      completed: false
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        this.cancelFutureTask();

        /*
         * Automatically reveal the newly created
         * future task so the user can see it.
         */
        this.showUpcomingTasks = true;

        this.loadTasks();
      },

      error: (error) => {
        console.error(
          'Failed to create future task:',
          error
        );
      }
    });
  }

  /* =========================
     TOGGLE
  ========================= */

  toggleTask(task: Task): void {
    // Prevent repeated clicks while the request is running
    if (this.togglingTaskId === task._id) {
      return;
    }
    this.togglingTaskId = task._id;
    this.taskToggleError = '';
    // Remember the original state in case the API fails
    const previousCompleted = task.completed;
    const previousCompletedAt = task.completedAt;
    // Immediately update the UI
    task.completed = !task.completed;
    if (task.completed) {
      task.completedAt = new Date().toISOString();
    } else {
      task.completedAt = undefined;
    }
    this.cdr.detectChanges();
    this.taskService.toggleTask(task._id).subscribe({
      next: (updatedTask: Task) => {
        // Use the actual backend result
        task.completed = updatedTask.completed;
        task.completedAt = updatedTask.completedAt;
        this.togglingTaskId = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error( 'Failed to toggle task:', error );
        // Revert the optimistic UI update
        task.completed = previousCompleted;
        task.completedAt = previousCompletedAt;
        this.togglingTaskId = null;
        this.taskToggleError = error?.error?.message || 'Unable to update this task. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  /* =========================
     EDIT
  ========================= */

  expandTask(task: Task): void {

    if (this.expandedTaskId === task._id) {
      this.closeExpandedTask();
      return;
    }

    this.expandedTaskId = task._id;
    this.editedTask = { ...task };
  }

  closeExpandedTask(): void {
    this.expandedTaskId = null;
    this.editedTask = null;
  }

  hasTaskChanges(task: Task): boolean {

    if (
      !this.editedTask ||
      this.editedTask._id !== task._id
    ) {
      return false;
    }

    return (
      this.editedTask.title !== task.title ||
      this.editedTask.description !== task.description ||
      this.editedTask.priority !== task.priority ||
      this.editedTask.dueDate !== task.dueDate
    );
  }

  saveTask(task: Task): void {

    if (
      !this.editedTask ||
      this.editedTask._id !== task._id
    ) {
      return;
    }

    if (!this.editedTask.title.trim()) {
      return;
    }

    this.savingTaskId = task._id;

    const update = {
      title: this.editedTask.title.trim(),
      description:
        this.editedTask.description || '',
      priority: this.editedTask.priority,
      dueDate: this.editedTask.dueDate
    };

    this.taskService
      .updateTask(task._id, update)
      .subscribe({

        next: (updatedTask: Task) => {

          Object.assign(
            task,
            updatedTask
          );

          this.editedTask = {
            ...updatedTask
          };

          this.savingTaskId = null;

          /*
           * If the due date was changed from past → future
           * or future → past, rebuild the visible groups.
           */
          this.loadTasks();
        },

        error: (error) => {

          console.error(
            'Failed to update task:',
            error
          );

          this.savingTaskId = null;

          this.cdr.detectChanges();
        }
      });
  }

  /* =========================
     DELETE
  ========================= */

deleteTask(task: Task): void {
  this.deleteConfirmationTask = task;
}

cancelDelete(): void {
  this.deleteConfirmationTask = null;
}

confirmDelete(): void {
  const task = this.deleteConfirmationTask;

  if (!task) {
    return;
  }

  this.taskService
    .deleteTask(task._id)
    .subscribe({

      next: () => {

        if (
          this.expandedTaskId ===
          task._id
        ) {
          this.closeExpandedTask();
        }

        this.deleteConfirmationTask = null;

        this.loadTasks();
      },

      error: (error) => {
        console.error(
          'Failed to delete task:',
          error
        );

        this.deleteConfirmationTask = null;
        this.cdr.detectChanges();
      }
    });
}
  /* =========================
     PRIORITY
  ========================= */

  getPriorityClass(
    priority: string
  ): string {
    return priority.toLowerCase();
  }

  /* =========================
     TRACKING
  ========================= */

  trackTask(
    _: number,
    task: Task
  ): string {
    return task._id;
  }

  trackDay(
    _: number,
    day: TaskDay
  ): string {
    return this.getDateKey(
      day.date.toISOString()
    );
  }

  /* =========================
    MOVE PAST TASKS TO TODAY
  ========================= */

  public getUnfinishedPastTasks(): Task[] {
    const today = this.startOfDay(new Date());

    return this.allTasks.filter(task => {
      if (task.completed || !task.dueDate) {
        return false;
      }

      const dueDate = this.startOfDay(
        new Date(task.dueDate)
      );

      return dueDate.getTime() < today.getTime();
    });
  }

  onMovePastTasksChange(): void {
    if (!this.movePastTasksChecked) {
      return;
    }

    const pastTasks = this.getUnfinishedPastTasks();

    if (pastTasks.length === 0) {
      this.movePastTasksChecked = false;
      return;
    }

    this.showMovePastTasksConfirmation = true;
  }

  cancelMovePastTasks(): void {
    this.movePastTasksChecked = false;
    this.showMovePastTasksConfirmation = false;
  }

  confirmMovePastTasks(): void {
    const pastTasks = this.getUnfinishedPastTasks();

    if (
      pastTasks.length === 0 ||
      this.movingPastTasks
    ) {
      this.cancelMovePastTasks();
      return;
    }

    this.movingPastTasks = true;

    const today = this.startOfDay(new Date());
    const todayDate = today.toISOString();

    let completedRequests = 0;
    let hasError = false;

    pastTasks.forEach(task => {
      this.taskService
        .updateTask(task._id, {
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          dueDate: todayDate
        })
        .subscribe({
          next: () => {
            completedRequests++;

            if (completedRequests === pastTasks.length) {
              this.movingPastTasks = false;
              this.movePastTasksChecked = false;
              this.showMovePastTasksConfirmation = false;

              this.loadTasks();
            }
          },

          error: (error) => {
            console.error(
              'Failed to move task to today:',
              error
            );

            hasError = true;
            completedRequests++;

            if (completedRequests === pastTasks.length) {
              this.movingPastTasks = false;
              this.movePastTasksChecked = false;
              this.showMovePastTasksConfirmation = false;

              this.taskToggleError =
                'Some tasks could not be moved to today. Please try again.';

              this.loadTasks();
            }
          }
        });
    });
  }
}