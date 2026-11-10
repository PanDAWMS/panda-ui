import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'breakAt',
  standalone: true,
})
export class BreakAtPipe implements PipeTransform {
  transform(value: string | number | null | undefined, chars: string = '.'): string {
    if (value == null) return '';
    const str = String(value);

    const escaped: string = chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`([${escaped}])`, 'g');

    return str.replace(regex, '$1\u200B');
  }
}
