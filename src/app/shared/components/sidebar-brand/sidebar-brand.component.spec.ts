import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarBrandComponent } from './sidebar-brand.component';

describe('SidebarBrandComponent', () => {
  let component: SidebarBrandComponent;
  let fixture: ComponentFixture<SidebarBrandComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarBrandComponent]
    });
    fixture = TestBed.createComponent(SidebarBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
