import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration } from '../utils/date-utils';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(start?: string | Date | null, end?: string | Date | null): string {
    return formatDuration(start, end);
  }
}
