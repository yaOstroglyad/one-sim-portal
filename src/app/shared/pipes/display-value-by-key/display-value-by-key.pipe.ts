import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'displayValueByKey'
})
export class DisplayValueByKeyPipe implements PipeTransform {
  transform(item: any, key: string): any {
    const keys = key.split('.');
    let value = item;

    for (const k of keys) {
      value = value[k];
    }

    return value;
  }
}
