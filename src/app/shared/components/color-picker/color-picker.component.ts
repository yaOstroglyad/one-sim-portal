import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="color-picker-container">
      <label>{{label}}</label>
      <div class="color-picker-wrapper">
        <input type="color" 
               [value]="value"
               (input)="onInput($event)"
               #colorInput>
        <div class="color-preview" 
             [style.backgroundColor]="value"
             (click)="colorInput.click()">
        </div>
        <span class="color-value">{{value}}</span>
      </div>
    </div>
  `,
  styles: [`
    .color-picker-container {
      margin-bottom: 1.5rem;
    
      label {
        display: block;
        margin-bottom: 0.5rem;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
    
      .color-picker-wrapper {
        display: flex;
        align-items: center;
        gap: 1rem;
    
        input[type="color"] {
          width: 0;
          height: 0;
          visibility: hidden;
          position: absolute;
        }
    
        .color-preview {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #ddd;
          cursor: pointer;
          transition: transform 0.2s;
    
          &:hover {
            transform: scale(1.05);
          }
        }
    
        .color-value {
          font-family: monospace;
          color: rgba(0, 0, 0, 0.87);
          font-size: 14px;
        }
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  value: string = '#000000';
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
  }
} 