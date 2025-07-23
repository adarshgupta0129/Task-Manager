import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TaskService, Task, TaskLog } from "./services/task.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  currentView: "entry" | "list" = "entry";
  taskForm: FormGroup;
  editForm: FormGroup;
  logForm: FormGroup;

  tasks: Task[] = [];
  teamMembers: string[] = [];
  taskLogs: TaskLog[] = [];

  showLogModal = false;
  showEditModal = false;
  selectedTask: Task | null = null;
  currentDate = new Date().toLocaleDateString();

  constructor(private fb: FormBuilder, private taskService: TaskService) {
    this.taskForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", [Validators.required, Validators.minLength(10)]],
      dueDate: ["", Validators.required],
      status: ["Not started", Validators.required],
      assignee: ["", Validators.required],
    });

    this.editForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", [Validators.required, Validators.minLength(10)]],
      dueDate: ["", Validators.required],
      status: ["Not started", Validators.required],
      assignee: ["", Validators.required],
    });

    this.logForm = this.fb.group({
      progress: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      remarks: ["", [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit() {
    this.loadTeamMembers();
    this.loadTasks();
  }

  setView(view: "entry" | "list") {
    this.currentView = view;
    if (view === "list") {
      this.loadTasks();
    }
  }

  loadTeamMembers() {
    this.taskService.getTeamMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
      },
      error: (error) => {
        console.error("Error loading team members:", error);
      },
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error("Error loading tasks:", error);
      },
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.taskService.createTask(this.taskForm.value).subscribe({
        next: (task) => {
          console.log("Task created successfully:", task);
          this.resetForm();
          this.loadTasks();
        },
        error: (error) => {
          console.error("Error creating task:", error);
        },
      });
    }
  }

  resetForm() {
    this.taskForm.reset({
      status: "Not started",
    });
  }

  editTask(task: Task) {
    this.selectedTask = task;
    const dueDate = new Date(task.dueDate).toISOString().split("T")[0];

    this.editForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: dueDate,
      status: task.status,
      assignee: task.assignee,
    });

    this.showEditModal = true;
  }

  updateTask() {
    if (this.editForm.valid && this.selectedTask?._id) {
      this.taskService
        .updateTask(this.selectedTask._id, this.editForm.value)
        .subscribe({
          next: (updatedTask) => {
            console.log("Task updated successfully:", updatedTask);
            this.closeEditModal();
            this.loadTasks();
          },
          error: (error) => {
            console.error("Error updating task:", error);
          },
        });
    }
  }

  deleteTask(taskId: string) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          console.log("Task deleted successfully");
          this.loadTasks();
        },
        error: (error) => {
          console.error("Error deleting task:", error);
        },
      });
    }
  }

  openTaskLog(task: Task) {
    this.selectedTask = task;
    this.showLogModal = true;
    this.loadTaskLogs(task._id!);
  }

  loadTaskLogs(taskId: string) {
    this.taskService.getTaskLogs(taskId).subscribe({
      next: (logs) => {
        this.taskLogs = logs;
      },
      error: (error) => {
        console.error("Error loading task logs:", error);
      },
    });
  }

  addLog() {
    if (this.logForm.valid && this.selectedTask?._id) {
      this.taskService
        .createTaskLog(this.selectedTask._id, this.logForm.value)
        .subscribe({
          next: (log) => {
            console.log("Log added successfully:", log);
            this.logForm.reset({ progress: 0 });
            this.loadTaskLogs(this.selectedTask!._id!);
          },
          error: (error) => {
            console.error("Error adding log:", error);
          },
        });
    }
  }

  closeLogModal() {
    this.showLogModal = false;
    this.selectedTask = null;
    this.taskLogs = [];
    this.logForm.reset({ progress: 0 });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedTask = null;
    this.editForm.reset();
  }
}
