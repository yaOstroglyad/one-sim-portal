import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from '../../../shared';
import { Domain } from '../../../shared/model/domain';

@Injectable({
  providedIn: 'root'
})
export class DomainsTableService extends TableConfigAbstractService<Domain> {
  public originalDataSubject = new BehaviorSubject<Domain[]>([]);
  public dataList$: Observable<Domain[]> = this.originalDataSubject.asObservable();
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 20
    },
    translatePrefix: 'domains.',
    showCheckboxes: false,
    showEditButton: true,
    showAddButton: true,
    showMenu: true,
    columns: [
      {visible: false, key: 'id', header: 'id'},
      {visible: true, key: 'name', header: 'name'},
      {visible: true, templateType: TemplateType.Text, key: 'owner.name', header: 'owner'},
      {visible: true, key: 'applicationType', header: 'applicationType'},
      {
        visible: true,
        key: 'active',
        header: 'status',
        templateType: TemplateType.Custom,
        customTemplate: () => this.activeTemplate
      }
    ]
  });

  activeTemplate: any;

  constructor() {
    super();
  }

  public updateTableData(data: Domain[]): void {
    this.originalDataSubject.next(data);
  }
}
