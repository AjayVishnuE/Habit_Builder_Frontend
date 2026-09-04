import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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

  loading = true;
  addingTaskFor: string | null = null;

  newTaskTitle = '';
  newTaskPriority: 'Low' | 'Medium' | 'High' = 'Medium';

  expandedTaskId: string | null = null;

  editedTask: Task | null = null;
  savingTaskId: string | null = null;

  ngOnInit(): void {
    this.loadTasks();
    this.cdr.detectChanges();
  }

  loadTasks(): void {
    this.loading = true;

    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        this.buildTaskDays(tasks);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load tasks:', error);
        this.loading = false;
      }
    });
  }

  private buildTaskDays(tasks: Task[]): void {
    const grouped = new Map<string, Task[]>();

    tasks.forEach(task => {
      const dateKey = this.getDateKey(task.dueDate);

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }

      grouped.get(dateKey)!.push(task);
    });

    const today = this.startOfDay(new Date());

    const dates = Array.from(grouped.keys())
      .map(key => this.parseDateKey(key))
      .filter(date => date <= today)
      .sort((a, b) => b.getTime() - a.getTime());

    this.taskDays = dates.map(date => ({
      date,
      tasks: grouped.get(this.getDateKey(date.toISOString())) || []
    }));

    // Always show today even if there are no tasks.
    if (!this.taskDays.some(day => this.isToday(day.date))) {
      this.taskDays.unshift({
        date: today,
        tasks: []
      });
    }
  }

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
    return new Date(year, month - 1, day);
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

  getDayLabel(date: Date): string {
    if (this.isToday(date)) {
      return 'Today';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long'
    });
  }

  getFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  openAddTask(date: Date): void {
    this.addingTaskFor = this.getDateKey(date.toISOString());
    this.newTaskTitle = '';
    this.newTaskPriority = 'Medium';
  }

  cancelAddTask(): void {
    this.addingTaskFor = null;
    this.newTaskTitle = '';
  }

  saveNewTask(date: Date): void {
    const title = this.newTaskTitle.trim();

    if (!title) {
      return;
    }

    const task = {
      title,
      description: '',
      dueDate: date.toISOString(),
      priority: this.newTaskPriority,
      completed: false
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        this.cancelAddTask();
        this.loadTasks();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to create task:', error);
      }
    });
  }

  toggleTask(task: Task): void {
    this.taskService.toggleTask(task._id).subscribe({
      next: (updatedTask: Task) => {
        task.completed = updatedTask.completed;
        task.completedAt = updatedTask.completedAt;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to toggle task:', error);
      }
    });
  }

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
    if (!this.editedTask || this.editedTask._id !== task._id) {
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
    if (!this.editedTask || this.editedTask._id !== task._id) {
      return;
    }

    if (!this.editedTask.title.trim()) {
      return;
    }

    this.savingTaskId = task._id;

    const update = {
      title: this.editedTask.title.trim(),
      description: this.editedTask.description || '',
      priority: this.editedTask.priority,
      dueDate: this.editedTask.dueDate
    };

    this.taskService.updateTask(task._id, update).subscribe({
      next: (updatedTask: Task) => {
        Object.assign(task, updatedTask);
        this.editedTask = { ...updatedTask };
        this.savingTaskId = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to update task:', error);
        this.savingTaskId = null;
      }
    });
  }

  deleteTask(task: Task): void {
    const confirmed = confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.taskService.deleteTask(task._id).subscribe({
      next: () => {
        if (this.expandedTaskId === task._id) {
          this.closeExpandedTask();
        }
        this.loadTasks();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to delete task:', error);
      }
    });
  }

  getPriorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  trackTask(_: number, task: Task): string {
    return task._id;
  }

  trackDay(_: number, day: TaskDay): string {
    return this.getDateKey(day.date.toISOString());
  }
}