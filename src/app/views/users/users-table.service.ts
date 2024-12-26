import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, User } from 'src/app/shared';

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
      { visible: true, key: 'username', header: 'username' },
      { visible: true, key: 'accountId', header: 'accountId' },
      { visible: true, key: 'accountType', header: 'accountType' },
      { visible: true, key: 'firstName', header: 'firstName' },
      { visible: true, key: 'lastName', header: 'lastName' },
      { visible: true, key: 'email', header: 'email' }
    ]
  });

  constructor() {
    super();
  }

  public updateTableData(data: User[]): void {
    this.originalDataSubject.next(data);
  }
}
