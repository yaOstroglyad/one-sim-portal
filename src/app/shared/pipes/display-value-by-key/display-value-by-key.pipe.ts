import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'displayValueByKey'
})
export class DisplayValueByKeyPipe implements PipeTransform {
  transform(item: any, key: string): any {
    if (!item || !key) {
      return null;
    }

    const keys = key.split('.');
    let value = item;

    for (const k of keys) {
      if (value == null) {
        return null;
      }
      value = value[k];
    }

    return value;
  }
}
