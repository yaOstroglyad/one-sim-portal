import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'itemNames'
})
export class ItemNamesPipe implements PipeTransform {
  transform(items: any[], maxDisplay: number = 4, property: string = 'name'): string {
    if (!items || items.length === 0) {
      return '';
    }

    const names = items.map(item => item[property]);
    if (names.length <= maxDisplay) {
      return names.join(', ');
    }

    const displayedNames = names.slice(0, maxDisplay);
    return `${displayedNames.join(', ')}...`;
  }
}
