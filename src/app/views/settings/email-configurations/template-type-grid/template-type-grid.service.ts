import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from '../../../../shared';
import { EmailTemplate } from '../../../../shared';

@Injectable()
export class TemplateTypeGridService extends TableConfigAbstractService<EmailTemplate> {
  public isPrimaryTemplate: TemplateRef<any>;
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: '',
    showCheckboxes: false,
    showEditButton: false,
    showAddButton: true,
    showMenu: true,
    columns: [
      { visible: true, key: 'language', header: 'language', sortable: true },
      { visible: true, key: 'subject', header: 'subject', sortable: true },
      {
        visible: true,
        key: 'primary',
        header: 'isPrimary',
        templateType: TemplateType.Custom,
        customTemplate: () => this.isPrimaryTemplate
      }
    ]
  });

  constructor() {
    super();
  }
}
