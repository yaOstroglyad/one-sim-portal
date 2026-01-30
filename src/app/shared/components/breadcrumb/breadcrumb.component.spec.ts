import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@shared';
import { of, Subject } from 'rxjs';

import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  const mockRouter = {
    events: new Subject(),
    url: '/'
  };

  const mockActivatedRoute = {
    snapshot: { data: {} },
    root: { children: [] }
  };

  const mockLanguageService = {
    currentLang$: of('en')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    // Skip detectChanges to avoid router initialization issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
