import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageBufferService } from '../../../../core/services/message-buffer.service';

export interface OmniResult {
  title: string;
  type: 'task' | 'dataset';
  id: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-search-omni',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './omni.component.html',
  styleUrls: ['./omni.component.scss'],
})
export class SearchOmniComponent implements OnInit {
  private api = inject(ApiService);
  private log = inject(LoggingService).forContext('SearchOmniComponent');
  private message = inject(MessageBufferService);
  private router = inject(Router);
  private eRef = inject(ElementRef);

  @ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;

  searchControl = new FormControl('');
  results: OmniResult[] = [];
  isLoading = false;

  ngOnInit(): void {}

  onEnter(): void {
    const cleanQuery = this.searchControl.value?.trim() || '';

    // Clear results if the input is empty
    if (!cleanQuery) {
      this.results = [];
      return;
    }
    this.isLoading = true;
    this.api.get<OmniResult[]>(`search/global`, { q: cleanQuery }).subscribe({
      next: (res) => {
        this.results = res || [];
        this.isLoading = false;

        // If there's exactly 1 result, auto-navigate immediately
        if (this.results.length === 1) {
          this.navigateTo(this.results[0]);
        } else if (this.results.length > 1) {
          // 2 or more results -> Open autocomplete dropdown panel
          setTimeout(() => this.autoTrigger?.openPanel());
        } else {
          this.log.warn('0 search results returned');
          this.message.add('Nothing found', 'Close', { duration: 5000 });
          this.autoTrigger?.closePanel();
        }
      },
      error: () => {
        this.log.error(`Failed to get search results`);
        this.results = [];
        this.isLoading = false;
      },
    });
  }

  navigateTo(result: OmniResult): void {
    const route = `/${result.type}/${result.id}`;
    this.router.navigateByUrl(route);
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.results = [];
    this.autoTrigger?.closePanel();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.results = [];
      this.autoTrigger?.closePanel();
    }
  }
}
