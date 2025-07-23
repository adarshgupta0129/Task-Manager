import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Task {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "Not started" | "In progress" | "Completed";
  assignee: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskLog {
  _id?: string;
  taskId: string;
  date?: string;
  progress: number;
  remarks: string;
  createdAt?: string;
}

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private apiUrl = "http://localhost:1000/api";

  constructor(private http: HttpClient) {}

  // Task operations
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`);
  }

  // Task log operations
  getTaskLogs(taskId: string): Observable<TaskLog[]> {
    return this.http.get<TaskLog[]>(`${this.apiUrl}/tasks/${taskId}/logs`);
  }

  createTaskLog(taskId: string, log: TaskLog): Observable<TaskLog> {
    return this.http.post<TaskLog>(`${this.apiUrl}/tasks/${taskId}/logs`, log);
  }

  // Team members
  getTeamMembers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/team-members`);
  }
}
