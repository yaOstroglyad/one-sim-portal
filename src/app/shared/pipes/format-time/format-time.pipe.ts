import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {

  transform(value: number): string {
    if (value && !isNaN(value)) {
      const hours = Math.floor(value / 3600000); // часы
      const minutes = Math.floor((value - hours * 3600000) / 60000); // минуты
      const seconds = Math.floor((value - hours * 3600000 - minutes * 60000) / 1000); // секунды

      const hoursFormatted = this.pad(hours, 2);
      const minutesFormatted = this.pad(minutes, 2);
      const secondsFormatted = this.pad(seconds, 2);

      return `${hoursFormatted}:${minutesFormatted}:${secondsFormatted}`;
    }
    return '00:00:00';
  }

  private pad(num: number, size: number): string {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
  }

}
