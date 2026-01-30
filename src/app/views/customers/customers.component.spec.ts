import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IconSetService } from '@coreui/icons-angular';
import { of } from 'rxjs';

import { CustomersComponent } from './customers.component';
import { CustomersDataService, CompaniesDataService, AuthService, PageLayoutService } from '@shared';
import { iconSubset } from '../../icons/icon-subset';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        IconSetService,
        { provide: CustomersDataService, useValue: { paginatedCustomers: () => of({ content: [], totalPages: 0 }) } },
        { provide: CompaniesDataService, useValue: { getCompanies: () => of([]) } },
        { provide: AuthService, useValue: { hasPermission: () => false } },
        { provide: PageLayoutService, useValue: { header: { set: jest.fn() } } }
      ]
    }).compileComponents();

    iconSetService = TestBed.inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
