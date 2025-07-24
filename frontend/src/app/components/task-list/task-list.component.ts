import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
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
  isUpdating = false;

  // Modal states
  showLogModal = false;
  showEditModal = false;

  // Filter properties
  statusFilter: string = "";
  assigneeFilter: string = "";
  uniqueAssignees: string[] = [];

  // Team members and task progress data
  teamMembers: string[] = [];
  taskProgressMap: Map<string, number> = new Map();

  // Edit form
  editForm: FormGroup;

  constructor(private taskService: TaskService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      assignee: ["", [Validators.required]],
      status: ["Not started"],
      dueDate: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadTasks(); // Default load (active tasks only)
    this.loadTeamMembers();
  }

  loadTasks(includeDeleted?: string): void {
    this.loading = true;
    console.log("Loading tasks with includeDeleted:", includeDeleted); // Debug log

    this.taskService.getTasks(includeDeleted).subscribe({
      next: (tasks) => {
        console.log("Tasks loaded:", tasks); // Debug log
        console.log("Tasks count:", tasks.length); // Debug log

        this.tasks = tasks;
        this.filteredTasks = [...tasks];
        // Only get unique assignees from active tasks for the filter
        this.uniqueAssignees = [
          ...new Set(
            tasks.filter((task) => task.active).map((task) => task.assignee)
          ),
        ];
        this.loading = false;
        this.applyFilters();
        this.loadTaskProgress();
      },
      error: (error) => {
        console.error("Error loading tasks:", error);
        this.loading = false;
      },
    });
  }

  loadTeamMembers(): void {
    this.taskService.getTeamMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
      },
      error: (error) => {
        console.error("Error loading team members:", error);
      },
    });
  }

  loadTaskProgress(): void {
    // Load progress for each active task only
    this.tasks
      .filter((task) => task.active)
      .forEach((task) => {
        if (task._id) {
          this.taskService.getTaskLogs(task._id).subscribe({
            next: (logs) => {
              if (logs.length > 0) {
                // Get the latest log entry for progress
                const latestLog = logs[0]; // logs are sorted by createdAt DESC
                this.taskProgressMap.set(task._id!, latestLog.progress);
              }
            },
            error: (error) => {
              console.error(`Error loading logs for task ${task._id}:`, error);
            },
          });
        }
      });
  }

  getTaskProgress(taskId: string): number | null {
    return this.taskProgressMap.get(taskId) || null;
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter((task) => {
      // Handle special status filters
      if (this.statusFilter === "deleted") {
        return !task.active;
      } else if (this.statusFilter === "all") {
        // Show all records, no status filtering
      } else if (this.statusFilter && this.statusFilter !== "") {
        // Regular status filtering (only for active tasks)
        if (!task.active) return false;
        if (task.status.toLowerCase() !== this.statusFilter.toLowerCase())
          return false;
      } else {
        // Default: show only active tasks when no status filter is selected
        if (!task.active) return false;
      }

      // Apply assignee filter (only for active tasks when not showing deleted)
      const matchesAssignee =
        !this.assigneeFilter ||
        task.assignee.toLowerCase().includes(this.assigneeFilter.toLowerCase());

      return matchesAssignee;
    });
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    console.log("Status filter changed to:", status); // Debug log

    // Load appropriate data based on filter selection
    if (status === "deleted") {
      console.log("Loading deleted tasks..."); // Debug log
      this.loadTasks("true"); // Load only deleted records
    } else if (status === "all") {
      console.log("Loading all tasks..."); // Debug log
      this.loadTasks("all"); // Load all records
    } else {
      console.log("Loading active tasks..."); // Debug log
      this.loadTasks(); // Load only active records (default)
    }
  }

  onAssigneeFilterChange(assignee: string): void {
    this.assigneeFilter = assignee;
    this.applyFilters();
  }

  clearFilters(): void {
    this.statusFilter = "";
    this.assigneeFilter = "";
    this.loadTasks(); // Reload with default (active only) data
  }

  editTask(task: Task): void {
    this.selectedTask = task;
    const dueDate = new Date(task.dueDate).toISOString().split("T")[0];

    this.editForm.patchValue({
      assignee: task.assignee,
      status: task.status,
      dueDate: dueDate,
    });

    this.showEditModal = true;
  }

  updateTask(): void {
    if (this.editForm.valid && this.selectedTask?._id) {
      this.isUpdating = true;
      this.taskService
        .updateTask(this.selectedTask._id, this.editForm.value)
        .subscribe({
          next: (updatedTask) => {
            console.log("Task updated successfully:", updatedTask);
            this.isUpdating = false;
            this.closeEditModal();
            this.loadTasks(); // Reload tasks to get updated data
          },
          error: (error) => {
            console.error("Error updating task:", error);
            this.isUpdating = false;
            alert("Error updating task. Please try again.");
          },
        });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedTask = null;
    this.editForm.reset({
      status: "Not started",
    });
  }

  deleteTask(taskId: string): void {
    if (
      confirm(
        "Are you sure you want to delete this task? It will be moved to deleted records."
      )
    ) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          console.log("Task deleted successfully");
          this.loadTasks(); // Reload tasks
        },
        error: (error) => {
          console.error("Error deleting task:", error);
          alert("Error deleting task. Please try again.");
        },
      });
    }
  }

  restoreTask(taskId: string): void {
    if (confirm("Are you sure you want to restore this task?")) {
      this.taskService.restoreTask(taskId).subscribe({
        next: (restoredTask) => {
          console.log("Task restored successfully:", restoredTask);
          // Reload the current view
          if (this.statusFilter === "deleted") {
            this.loadTasks("true");
          } else if (this.statusFilter === "all") {
            this.loadTasks("all");
          } else {
            this.loadTasks();
          }
        },
        error: (error) => {
          console.error("Error restoring task:", error);
          alert("Error restoring task. Please try again.");
        },
      });
    }
  }

  permanentDeleteTask(taskId: string): void {
    if (
      confirm(
        "⚠️ WARNING: This will permanently delete the task and all its logs. This action cannot be undone. Are you sure?"
      )
    ) {
      this.taskService.permanentDeleteTask(taskId).subscribe({
        next: () => {
          console.log("Task permanently deleted");
          // Reload the current view
          if (this.statusFilter === "deleted") {
            this.loadTasks("true");
          } else if (this.statusFilter === "all") {
            this.loadTasks("all");
          } else {
            this.loadTasks();
          }
        },
        error: (error) => {
          console.error("Error permanently deleting task:", error);
          alert("Error permanently deleting task. Please try again.");
        },
      });
    }
  }

  openTaskLog(task: Task): void {
    this.selectedTask = task;
    this.showLogModal = true;
  }

  closeTaskLog(): void {
    this.selectedTask = null;
    this.showLogModal = false;
  }

  onLogAdded(): void {
    // Refresh tasks and progress to get updated information
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
