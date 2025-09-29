import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  TableConfig,
  TableConfigAbstractService,
  TemplateType,
  User
} from '../../../shared';

@Injectable({
  providedIn: 'root'
})
export class UsersTableService extends TableConfigAbstractService<User> {
  userRolesTemplate: TemplateRef<any>;
  
  public originalDataSubject = new BehaviorSubject<User[]>([]);
  public dataList$: Observable<User[]> = this.originalDataSubject.asObservable();
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20
    },
    translatePrefix: 'user.',
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: true,
    showMenu: true,
    columns: [
      { visible: true, key: 'loginName', header: 'username' },
      { visible: true, templateType: TemplateType.Text, key: 'accountInfo.externalId', header: 'externalId' },
      { visible: true, templateType: TemplateType.Text, key: 'accountInfo.type', header: 'accountType' },
      { visible: true, key: 'name', header: 'name' },
      { visible: true, key: 'email', header: 'email' },
      { visible: true, templateType: TemplateType.Custom, key: 'roles', header: 'roles', customTemplate: () => this.userRolesTemplate }
    ]
  });

  constructor() {
    super();
  }

  public updateTableData(data: User[]): void {
    this.originalDataSubject.next(data);
  }

  public setUserRolesTemplate(template: TemplateRef<any>): void {
    this.userRolesTemplate = template;
  }
}