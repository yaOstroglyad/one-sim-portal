import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormConfig } from './field-config';
import { FormBuilder, FormGroup } from '@angular/forms';
import { createControl } from './form-generator.utils';

@Component({
  selector: 'app-form-generator',
  templateUrl: './form-generator.component.html',
  styleUrls: ['./form-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormGeneratorComponent implements OnInit {
  @Input() config: FormConfig;
  @Output() formChanges = new EventEmitter<FormGroup>();
  form: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.createGroup(this.config);
    this.form.valueChanges.subscribe(() => {
      this.formChanges.emit(this.form);
    });
  }

  createGroup(config: FormConfig): FormGroup {
    const groupControls = config.fields.reduce((controls, field) => {
      controls[field.name] = createControl(field);
      return controls;
    }, {});

    return this.fb.group(groupControls, {validators: config.formValidators});
  }
}
