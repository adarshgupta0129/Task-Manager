import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService, Task, TaskLog } from '../../services/task.service';

@Component({
  selector: 'app-task-log',
  templateUrl: './task-log.component.html',
  styleUrls: ['./task-log.component.css']
})
export class TaskLogComponent implements OnInit {
  @Input() task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() logAdded = new EventEmitter<void>();

  logForm: FormGroup;
  taskLogs: TaskLog[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    this.logForm = this.fb.group({
      date: [this.getCurrentDate()],
      progress: [0],
      remarks: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadTaskLogs();
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadTaskLogs(): void {
    if (this.task._id) {
      this.taskService.getTaskLogs(this.task._id).subscribe({
        next: (logs) => {
          this.taskLogs = logs;
        },
        error: (error) => {
          console.error('Error loading task logs:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.logForm.valid && this.task._id) {
      this.isSubmitting = true;
      const logData: TaskLog = {
        taskId: this.task._id,
        progress: this.logForm.value.progress,
        remarks: this.logForm.value.remarks
      };

      this.taskService.createTaskLog(this.task._id, logData).subscribe({
        next: (newLog) => {
          this.isSubmitting = false;
          this.taskLogs.unshift(newLog);
          this.logForm.patchValue({
            progress: 0,
            remarks: ''
          });
          this.logAdded.emit();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating task log:', error);
          alert('Error adding log entry. Please try again.');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProgressClass(progress: number): string {
    if (progress >= 80) return 'high';
    if (progress >= 50) return 'medium';
    if (progress >= 25) return 'low';
    return 'minimal';
  }
}