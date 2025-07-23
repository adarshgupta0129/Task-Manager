import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-task-entry',
  templateUrl: './task-entry.component.html',
  styleUrls: ['./task-entry.component.css']
})
export class TaskEntryComponent implements OnInit {
  taskForm: FormGroup;
  teamMembers: string[] = [];
  isSubmitting = false;
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      status: ['Not started'],
      assignee: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.taskService.getTeamMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
      },
      error: (error) => {
        console.error('Error loading team members:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isSubmitting = true;
      const task: Task = this.taskForm.value;
      
      this.taskService.createTask(task).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showSuccessMessage = true;
          this.resetForm();
          
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating task:', error);
          alert('Error creating task. Please try again.');
        }
      });
    }
  }

  resetForm(): void {
    this.taskForm.reset({
      status: 'Not started'
    });
  }
}