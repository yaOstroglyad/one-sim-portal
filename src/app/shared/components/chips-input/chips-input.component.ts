import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter, forwardRef,
  inject,
  Input,
  Output,
  signal
} from '@angular/core';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chips-input',
  templateUrl: './chips-input.component.html',
  styleUrls: ['./chips-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipsInputComponent),
      multi: true
    }
  ],
  standalone: true,
	imports: [MatFormFieldModule, MatChipsModule, MatIconModule, NgForOf, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsInputComponent implements ControlValueAccessor {
  @Input() label: string = 'Tags';
  @Input() placeholder: string = 'New item...';
  @Input() addOnBlur = true;
  @Input() separatorKeysCodes: number[] = [ENTER, COMMA];
  @Input() selectable = true;
  @Input() removable = true;

  @Output() itemsChange = new EventEmitter<string[]>();

  readonly items = signal<string[]>([]);
  readonly announcer = inject(LiveAnnouncer);

  private onChange: (value: any) => void;
  private onTouched: () => void;

  writeValue(items: string[]): void {
    this.items.set(items || []);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.items.update(items => [...items, value]);
      this.notifyValueChange();
    }

    if (event.input) {
      event.input.value = '';
    }
  }

  remove(item: string): void {
    this.items.update(items => {
      const index = items.indexOf(item);
      if (index >= 0) {
        items.splice(index, 1);
        this.announcer.announce(`Removed ${item}`);
      }
      return items;
    });
    this.notifyValueChange();
  }

  edit(item: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    if (!value) {
      this.remove(item);
      return;
    }

    this.items.update(items => {
      const index = items.indexOf(item);
      if (index >= 0) {
        items[index] = value;
      }
      return items;
    });
    this.notifyValueChange();
  }

  private notifyValueChange() {
    const items = this.items();
    this.itemsChange.emit(items);
    if (this.onChange) {
      this.onChange(items);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  trackByFn(index: number): number {
    return index;
  }

  setDisabledState(isDisabled: boolean): void {
    // You may want to disable the input when the form control is disabled
    // Example: handle disabling logic for the component here
  }
}
