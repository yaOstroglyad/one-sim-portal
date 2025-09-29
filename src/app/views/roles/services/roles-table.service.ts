import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TableConfig,
  TableConfigAbstractService,
  TemplateType
} from '../../../shared';
import { Role } from '../models';

@Injectable()
export class RolesTableService extends TableConfigAbstractService<Role> {

  public originalDataSubject = new BehaviorSubject<Role[]>([]);
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true
    },
    translatePrefix: 'roles.',
    showCheckboxes: false,
    showEditButton: false,
    showAddButton: true,
    showMenu: true,
    columns: [
      {
        visible: true,
        key: 'name',
        header: 'name',
        templateType: TemplateType.Text,
        sortable: false,
        minWidth: '150px'
      },
      {
        visible: true,
        key: 'displayName',
        header: 'displayName',
        templateType: TemplateType.Text,
        sortable: false,
        minWidth: '180px'
      },
      {
        visible: true,
        key: 'category',
        header: 'category',
        templateType: TemplateType.Text,
        sortable: false,
        minWidth: '120px'
      },
      {
        visible: true,
        key: 'description',
        header: 'description',
        templateType: TemplateType.Text,
        sortable: false,
        minWidth: '200px'
      },
      {
        visible: false,
        key: 'isProtected',
        header: 'isProtected',
        templateType: TemplateType.Text,
        sortable: false,
        minWidth: '100px',
        class: 'text-center'
      }
    ]
  });

  constructor() {
    super();
  }

  public updateTableData(data: Role[]): void {
    this.originalDataSubject.next(data);
  }
}
