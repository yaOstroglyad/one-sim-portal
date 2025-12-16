import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DisplayKeyValueComponent } from '../display-key-value/display-key-value.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-dynamic-entity-details-dialog',
    templateUrl: './dynamic-entity-details-dialog.component.html',
    styleUrls: ['./dynamic-entity-details-dialog.component.scss'],
    imports: [
        MatDialogModule,
        MatButtonModule,
        DisplayKeyValueComponent,
        TranslateModule
    ]
})
export class DynamicEntityDetailsDialogComponent implements OnInit {
  @Input() data: any;
  entries: Array<{ key: string; value: any }> = [];

  constructor(
    public dialogRef: MatDialogRef<DynamicEntityDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {}

  ngOnInit(): void {
    this.data = this.data || this.dialogData;
    this.entries = Object.entries(this.data).map(([key, value]) => ({
      key,
      value,
    }));
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }
}
