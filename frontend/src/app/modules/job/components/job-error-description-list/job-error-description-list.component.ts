import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable } from 'rxjs';
import { ErrorDescription } from '../../../../core/models/error-description.model';
import { ApiService } from '../../../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-job-error-description-list',
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MultiSelectModule,
    AsyncPipe,
    FormsModule,
  ],
  templateUrl: './job-error-description-list.component.html',
  styleUrl: './job-error-description-list.component.scss',
})
export class JobErrorDescriptionListComponent implements OnInit {
  private api = inject(ApiService);

  jobErrorDescriptions$!: Observable<ErrorDescription[]> | null;
  components: { label: string; value: string }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.jobErrorDescriptions$ = this.getJobErrorDescriptions();

    // Fetch unique component values for filtering
    this.jobErrorDescriptions$.subscribe((descriptions) => {
      const uniqueComponents = Array.from(new Set(descriptions.map((desc) => desc.component)));
      this.components = uniqueComponents.map((comp) => ({ label: comp, value: comp }));
    });
  }

  getJobErrorDescriptions(): Observable<ErrorDescription[]> {
    return this.api.get<ErrorDescription[]>('job/error-description');
  }

  onComponentFilterChange(selected: any[], filterCallback: (v: any) => void) {
    if (!selected || selected.length === 0) {
      filterCallback(null); // clear filter
      return;
    }
    // convert [{label, value}, …] → Array of values before passing to filter
    const values = selected.map((opt) => opt.value);
    filterCallback(values);
  }
}
