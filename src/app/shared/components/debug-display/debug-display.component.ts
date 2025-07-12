import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug-display.component.html',
  styleUrls: ['./debug-display.component.scss']
})
export class DebugDisplayComponent implements OnInit {
  @Input() data: any = {};
  @Input() title: string = 'DEBUG INFO';
  @Input() borderColor: string = 'blue';
  @Input() enabled: boolean = true;

  debugItems: { key: string, value: any, type: string }[] = [];

  ngOnInit(): void {
    this.processDebugData();
  }

  ngOnChanges(): void {
    this.processDebugData();
  }

  private processDebugData(): void {
    if (!this.data || !this.enabled) {
      this.debugItems = [];
      return;
    }

    this.debugItems = this.flattenObject(this.data);
  }

  private flattenObject(obj: any, prefix: string = ''): { key: string, value: any, type: string }[] {
    const items: { key: string, value: any, type: string }[] = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        const type = this.getValueType(value);

        if (type === 'object' && value !== null && !Array.isArray(value)) {
          // Recursively flatten nested objects
          items.push(...this.flattenObject(value, fullKey));
        } else {
          items.push({
            key: fullKey,
            value: this.formatValue(value),
            type
          });
        }
      }
    }

    return items;
  }

  private getValueType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  }

  private formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}