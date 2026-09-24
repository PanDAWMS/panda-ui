import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { Task } from './task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private api = inject(ApiService);

  getTask(jeditaskid: number): Observable<Task> {
    return this.api.get<Task>('task/' + jeditaskid);
  }
}
