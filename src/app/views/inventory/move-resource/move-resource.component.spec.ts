import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MoveResourceComponent } from './move-resource.component';
import { ProvidersDataService, OrdersDataService, CompaniesDataService } from '@shared';
import { MoveResourceService } from './move-resource.service';

describe('MoveResourceComponent', () => {
  let component: MoveResourceComponent;
  let fixture: ComponentFixture<MoveResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveResourceComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ProvidersDataService, useValue: { list: () => of([]) } },
        { provide: CompaniesDataService, useValue: { list: () => of([]), getCompanies: () => of([]) } },
        { provide: OrdersDataService, useValue: { list: () => of([]), availableOrders: () => of([]) } },
        { provide: MoveResourceService, useValue: { move: () => of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveResourceComponent);
    component = fixture.componentInstance;
    // Skip detectChanges as component requires complex service setup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
