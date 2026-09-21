import { inject, Service } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { Job } from './job.model';

@Service()
export class JobService {
  private api = inject(ApiService);

  getJob(pandaid: number): Observable<Job> {
    return this.api.get<Job>('job/' + pandaid);
  }
}
