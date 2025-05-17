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
               (input)="onColorInput($event)"
               #colorInput>
        <div class="color-preview" 
             [style.backgroundColor]="value"
             (click)="colorInput.click()">
        </div>
        <input type="text"
               class="color-value"
               [value]="value"
               (input)="onHexInput($event)"
               (paste)="onHexPaste($event)"
               (blur)="onBlur($event)">
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
          width: 80px;
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: transparent;
          
          &:focus {
            outline: none;
            border-color: #666;
          }
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

  onColorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateValue(input.value);
  }

  onHexInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newValue = input.value.trim();
    
    // Разрешаем любой ввод, но обновляем значение только если это валидный HEX
    if (this.isValidHexColor(newValue)) {
      this.updateValue(newValue.startsWith('#') ? newValue : '#' + newValue);
    }
  }

  onHexPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text')?.trim() || '';
    
    // Разрешаем вставку любого текста
    const input = event.target as HTMLInputElement;
    
    // Если это валидный HEX, обновляем значение компонента
    if (this.isValidHexColor(pastedText)) {
      const newValue = pastedText.startsWith('#') ? pastedText : '#' + pastedText;
      setTimeout(() => {
        this.updateValue(newValue);
      });
    }
  }

  onBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const newValue = input.value.trim();
    
    // При потере фокуса проверяем значение
    if (this.isValidHexColor(newValue)) {
      // Если значение валидное, обновляем с # если его нет
      this.updateValue(newValue.startsWith('#') ? newValue : '#' + newValue);
    } else {
      // Если значение невалидное, возвращаем последнее корректное
      input.value = this.value;
    }
    
    this.onTouched();
  }

  private updateValue(newValue: string): void {
    this.value = newValue;
    this.onChange(this.value);
  }

  private isValidHexColor(color: string): boolean {
    const hexPattern = /^#?([0-9A-F]{6}|[0-9A-F]{3})$/i;
    return hexPattern.test(color);
  }
}
