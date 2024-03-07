import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
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
  form: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.createGroup(this.config);
  }

  createGroup(config: FormConfig): FormGroup {
    const groupControls = config.fields.reduce((controls, field) => {
      controls[field.name] = createControl(field);
      return controls;
    }, {});

    return new FormGroup(groupControls, {validators: config.formValidators});
  }

}
