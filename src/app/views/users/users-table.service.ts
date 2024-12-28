import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType, User } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class UsersTableService extends TableConfigAbstractService<User> {
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
      { visible: true, key: 'email', header: 'email' }
    ]
  });

  // "id": "9b3e9dcd-e55f-4861-b85e-1603a836baa1",
  // "name": "ILYA KOROLKOV",
  // "loginName": "29935961",
  // "email": "mplaneta-tour@yandex.ru",
  // "phone": "+79109495261",
  // "createdAt": "2024-12-28T05:30:52.236639Z",
  // "createdBy": "anexit",
  // "accountInfo": {
  //   "id": "035a1d27-0dcf-41cb-96e8-80d512353888",
  //   "name": "KOROLKOV ILYA",
  //   "type": "CUSTOMER",
  //   "externalId": "29935961"
  // }

  constructor() {
    super();
  }

  public updateTableData(data: User[]): void {
    this.originalDataSubject.next(data);
  }
}
