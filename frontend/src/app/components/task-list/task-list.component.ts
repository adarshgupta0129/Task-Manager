import { Component, OnInit } from "@angular/core";
import { TaskService, Task } from "../../services/task.service";

@Component({
  selector: "app-task-list",
  templateUrl: "./task-list.component.html",
  styleUrls: ["./task-list.component.css"],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedTask: Task | null = null;
  loading = true;

  // Filter properties
  statusFilter: string = "";
  assigneeFilter: string = "";
  uniqueAssignees: string[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
        this.uniqueAssignees = [...new Set(tasks.map((task) => task.assignee))];
        this.loading = false;
        this.applyFilters(); // Apply any existing filters
      },
      error: (error) => {
        console.error("Error loading tasks:", error);
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter((task) => {
      const matchesStatus =
        !this.statusFilter ||
        task.status.toLowerCase() === this.statusFilter.toLowerCase();
      const matchesAssignee =
        !this.assigneeFilter ||
        task.assignee.toLowerCase().includes(this.assigneeFilter.toLowerCase());
      return matchesStatus && matchesAssignee;
    });
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onAssigneeFilterChange(assignee: string): void {
    this.assigneeFilter = assignee;
    this.applyFilters();
  }

  clearFilters(): void {
    this.statusFilter = "";
    this.assigneeFilter = "";
    this.filteredTasks = [...this.tasks];
  }

  updateTaskStatus(taskId: string, event: any): void {
    const newStatus = event.target.value;
    this.taskService.updateTask(taskId, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        const taskIndex = this.tasks.findIndex((t) => t._id === taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = updatedTask;
        }
      },
      error: (error) => {
        console.error("Error updating task status:", error);
        alert("Error updating task status. Please try again.");
      },
    });
  }

  deleteTask(taskId: string): void {
    if (confirm("Are you sure you want to delete this task?")) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter((t) => t._id !== taskId);
        },
        error: (error) => {
          console.error("Error deleting task:", error);
          alert("Error deleting task. Please try again.");
        },
      });
    }
  }

  openTaskLog(task: Task): void {
    this.selectedTask = task;
  }

  closeTaskLog(): void {
    this.selectedTask = null;
  }

  onLogAdded(): void {
    // Refresh tasks to get updated information
    this.loadTasks();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  isOverdue(dateString: string): boolean {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }
}
