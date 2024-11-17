import { Component, Input } from '@angular/core';
import { NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-display-key-value',
  templateUrl: './display-key-value.component.html',
  standalone: true,
  imports: [
    TitleCasePipe,
    NgForOf,
    NgIf,
    MatCardModule
  ],
  styleUrls: ['./display-key-value.component.scss']
})
export class DisplayKeyValueComponent {
  @Input() data: any;

  protected readonly isObject = (value: any) => value !== null && typeof value === 'object';
  protected readonly isArray = (value: any) => Array.isArray(value);

  entries: Array<{ key: string; value: any }> = [];

  ngOnInit(): void {
    this.entries = Object.entries(this.data).map(([key, value]) => ({
      key,
      value,
    }));
  }

  formatValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return value?.toString() || 'N/A';
  }
}
