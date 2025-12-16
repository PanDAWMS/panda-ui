import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private api = inject(ApiService);

  getTask(jeditaskid: number): Observable<Task> {
    return this.api.get<Task>('task/' + jeditaskid);
  }
}
